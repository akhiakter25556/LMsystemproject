# CareerCanvas LMS - Backend & Frontend Setup

## 🚀 Quick Start

### 1. Frontend (Next.js) - Port 3000
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Backend (Socket Server) - Port 4000
```bash
# Go to backend folder
cd bacanked/server

# Install dependencies (if not done)
npm install

# Start socket server
npm run dev
```

## 📁 Project Structure

```
├── src/                    # Frontend Next.js app
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── models/           # MongoDB models (shared)
│   └── lib/              # Utilities
├── bacanked/server/       # Backend socket server
│   ├── socket-server.ts  # Main socket server
│   ├── package.json      # Backend dependencies
│   └── .env.local        # Backend environment
└── package.json          # Frontend dependencies
```

## 🔧 Environment Variables

### Frontend (.env.local)
- `NEXT_PUBLIC_SOCKET_URL=http://localhost:4000`
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key

### Backend (bacanked/server/.env.local)
- `SOCKET_PORT=4000`
- `MONGODB_URI` - Same MongoDB connection
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

## 🌐 API Endpoints

### Socket Server (Port 4000)
- `GET /api/health` - Health check
- `GET /api/messages/:roomId` - Get room messages
- Socket.IO events for real-time messaging

### Next.js API (Port 3000)
- All existing API routes in `src/app/api/`

## 💬 Message System

- **Frontend**: Uses Socket.IO client to connect to port 4000
- **Backend**: Socket server handles real-time messaging
- **Database**: Messages saved to MongoDB with roomId support
- **Models**: Shared models in `src/models/`

## 🔄 Development Workflow

1. Start backend socket server: `cd bacanked/server && npm run dev`
2. Start frontend: `npm run dev`
3. Both servers run simultaneously
4. Messages are saved to database and broadcast in real-time

## ⚡ Performance Notes

- Socket server is lightweight and focused on messaging
- Frontend handles all other API operations
- Minimal file changes to existing structure
- TypeScript support maintained