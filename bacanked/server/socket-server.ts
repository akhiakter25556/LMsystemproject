import { createServer } from "http";
import { Server, Socket } from "socket.io";
import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env.local") });

dns.setDefaultResultOrder("ipv4first");

const app: Express = express();
const PORT = process.env.SOCKET_PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI as string;
const CLIENT_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection
let isConnected = false;

async function connectDB(): Promise<void> {
  if (!MONGODB_URI) {
    return;
  }

  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      dbName: "learning-management",
    });
    isConnected = true;
  } catch (error) {
    // Connection failed - continue without DB
  }
}

// Simple Message Schema (inline to avoid import issues)
const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String },
  roomId: { type: String, required: true, index: true },
  content: { type: String, required: true, maxlength: 2000 },
  messageType: { type: String, enum: ["text", "voice", "image", "file"], default: "text" },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  voiceData: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.models.SocketMessage || mongoose.model("SocketMessage", MessageSchema);

// ✅ API Routes
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/dashboard", (req: Request, res: Response) => {
  res.json({
    totalCourses: 0,
    enrolledStudents: 0,
    completionRate: 0,
  });
});

// Get room messages
app.get("/api/messages/:roomId", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
});

// Online Users Management
const onlineUsers = new Map<string, { socketId: string; role: string; name: string }>();

// Socket.IO Event Handlers
interface MessageData {
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  messageType?: string;
  voiceData?: string;
}

// Main Function
async function main(): Promise<void> {
  await connectDB();

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    // User joins
    socket.on("user:join", ({ userId, userName, userRole }: any) => {
      onlineUsers.set(userId, {
        socketId: socket.id,
        role: userRole,
        name: userName,
      });

      // Emit updated online users list
      io.emit(
        "users:online",
        Array.from(onlineUsers.entries()).map(([id, data]) => ({
          userId: id,
          ...data,
        }))
      );
    });

    // Join room
    socket.on("room:join", async ({ roomId, userId }: any) => {
      socket.join(roomId);
      
      // Send room history
      try {
        const messages = await Message.find({ roomId }).sort({ createdAt: -1 }).limit(50).lean();
        socket.emit("room:history", messages.reverse());
      } catch (error) {
        socket.emit("room:history", []);
      }
    });

    // Send message
    socket.on("message:send", async (data: MessageData) => {
      try {
        // Save message to database
        const messageDoc = new Message({
          senderId: data.senderId,
          roomId: data.roomId,
          content: data.content,
          messageType: data.messageType || "text",
          senderName: data.senderName,
          senderRole: data.senderRole,
          voiceData: data.voiceData,
          read: false,
        });

        const savedMessage = await messageDoc.save();

        // Emit to room
        io.to(data.roomId).emit("message:receive", {
          _id: savedMessage._id,
          roomId: data.roomId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderRole: data.senderRole,
          content: data.content,
          messageType: data.messageType || "text",
          voiceData: data.voiceData,
          read: false,
          createdAt: savedMessage.createdAt,
        });
      } catch (error) {
        socket.emit("message:error", { error: "Failed to send message" });
      }
    });

    // Typing events
    socket.on("typing:start", ({ roomId, userName }: any) => {
      socket.to(roomId).emit("typing:show", { userName });
    });

    socket.on("typing:stop", ({ roomId }: any) => {
      socket.to(roomId).emit("typing:hide");
    });

    // Disconnect
    socket.on("disconnect", () => {
      // Remove from online users
      for (const [userId, data] of onlineUsers.entries()) {
        if (data.socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      // Emit updated online users list
      io.emit(
        "users:online",
        Array.from(onlineUsers.entries()).map(([id, data]) => ({
          userId: id,
          ...data,
        }))
      );
    });
  });

  httpServer.listen(PORT, () => {
    // Server started successfully
  });
}

main().catch(() => {
  // Server startup failed
});