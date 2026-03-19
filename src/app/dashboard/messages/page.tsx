"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, CheckCheck, Circle, Search, Users, Headphones, MoreVertical, Mic, StopCircle, Smile, X } from "lucide-react";
import { io, Socket } from "socket.io-client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserData {
  _id?: string;
  name: string;
  email: string;
  photoURL?: string;
  role: string;
}

interface Message {
  _id?: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt?: string;
  read: boolean;
}

interface OnlineUser {
  userId: string;
  socketId: string;
  role: string;
  name: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userRole: string;
  roomId: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  photoURL?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
const STAFF_ROLES = ["admin", "instructor"];

const getRoomId = (userId: string) => `support_${userId}`;

const EMOJIS = [
  "😀","😂","😍","🥰","😎","🤩","😭","😤","🥺","😏",
  "👍","👎","❤️","🔥","🎉","✅","💯","🙏","💪","👏",
  "😊","🤔","😴","🤣","😇","🤗","😈","👀","💀","🫡",
  "🌟","💫","⚡","🎯","🚀","💥","🌈","🎊","🏆","🎁",
];
const getAvatar = (name: string, photoURL?: string, bg = "6366f1") =>
  photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&bold=true`;

function formatTime(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingBubble({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-2 mb-2">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
        {name[0]?.toUpperCase()}
      </div>
      <div>
        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm inline-flex">
          <div className="flex gap-1 items-center h-3">
            {[0, 150, 300].map(d => (
              <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 px-1">{name} is typing...</p>
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MsgBubble({ msg, fromMe, avatar, name }: {
  msg: Message; fromMe: boolean; avatar: string; name: string;
}) {
  return (
    <div className={`flex items-end gap-2 mb-3 ${fromMe ? "flex-row-reverse" : "flex-row"}`}>
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-gray-200">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className={`flex flex-col gap-0.5 max-w-[60%] ${fromMe ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-2 px-1 ${fromMe ? "flex-row-reverse" : "flex-row"}`}>
          {fromMe && msg.read
            ? <CheckCheck size={11} className="text-blue-400" />
            : fromMe ? <CheckCheck size={11} className="text-gray-300" /> : null}
          <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
          <span className="text-[11px] font-medium text-gray-500">{fromMe ? "You" : name}</span>
        </div>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
          ${fromMe
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
          }`}>
          {msg.content}
        </div>
      </div>
    </div>
  );
}

// ─── Contact item ─────────────────────────────────────────────────────────────
function ContactItem({ conv, active, onClick }: {
  conv: Conversation; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-gray-50
        ${active ? "bg-indigo-50 border-l-4 border-l-indigo-500" : "hover:bg-gray-50 border-l-4 border-l-transparent"}`}>
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-gray-100">
          <img src={getAvatar(conv.userName, conv.photoURL)} alt={conv.userName}
            className="w-full h-full object-cover" />
        </div>
        {conv.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-semibold text-gray-900 truncate">{conv.userName}</span>
          <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{conv.lastTime || ""}</span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs text-gray-400 truncate">{conv.lastMessage}</span>
          {conv.unread > 0 ? (
            <span className="w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {conv.unread}
            </span>
          ) : conv.lastMessage ? (
            <CheckCheck size={12} className="text-indigo-400 flex-shrink-0" />
          ) : null}
        </div>
      </div>
    </button>
  );
}

// ─── ✅ Input bar — OUTSIDE main component to prevent focus loss ───────────────
const InputBar = ({
  input, onChange, onKeyDown, onSend, connected, isStaff, placeholder,
  showEmoji, onToggleEmoji, onAddEmoji,
  recording, recordSecs, onStartRecord, onStopRecord,
  audioURL, onSendVoice, onCancelVoice,
}: {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  connected: boolean;
  isStaff: boolean;
  placeholder: string;
  showEmoji: boolean;
  onToggleEmoji: () => void;
  onAddEmoji: (e: string) => void;
  recording: boolean;
  recordSecs: number;
  onStartRecord: () => void;
  onStopRecord: () => void;
  audioURL: string | null;
  onSendVoice: () => void;
  onCancelVoice: () => void;
}) => (
  <div className="bg-white border-t border-gray-100 flex-shrink-0">
    {/* Emoji picker */}
    {showEmoji && (
      <div className="px-4 pt-3">
        <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100 max-h-28 overflow-y-auto">
          {EMOJIS.map((e, i) => (
            <button key={i} onClick={() => onAddEmoji(e)}
              className="text-lg hover:scale-125 transition-transform leading-none">
              {e}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Voice preview */}
    {audioURL && (
      <div className="px-4 pt-3 flex items-center gap-3">
        <audio controls src={audioURL} className="h-8 flex-1" />
        <button onClick={onCancelVoice} className="text-red-400 hover:text-red-600 transition-colors">
          <X size={16} />
        </button>
        <button onClick={onSendVoice}
          className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white transition-colors">
          <Send size={13} />
        </button>
      </div>
    )}

    {/* Input row */}
    <div className="px-4 py-3 flex items-center gap-2">
      {/* Emoji button */}
      <button onClick={onToggleEmoji}
        className={`flex-shrink-0 transition-colors ${showEmoji ? "text-indigo-500" : "text-gray-400 hover:text-indigo-500"}`}>
        <Smile size={20} />
      </button>

      {/* Voice button */}
      {recording ? (
        <button onClick={onStopRecord}
          className="flex-shrink-0 flex items-center gap-1.5 text-red-500 animate-pulse text-xs font-bold">
          <StopCircle size={20} /> {recordSecs}s
        </button>
      ) : (
        <button onClick={onStartRecord}
          className="flex-shrink-0 text-gray-400 hover:text-indigo-500 transition-colors">
          <Mic size={20} />
        </button>
      )}

      <input
        type="text"
        placeholder={placeholder}
        value={input}
        onChange={onChange}
        onKeyDown={onKeyDown}
        autoComplete="off"
        className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm text-gray-700 outline-none border border-gray-100 focus:border-indigo-300 transition-colors placeholder-gray-400"
      />
      <button
        onClick={onSend}
        disabled={!input.trim() || !connected}
        className="w-10 h-10 bg-red-500 hover:bg-red-600 disabled:opacity-40 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 flex-shrink-0 shadow-sm"
      >
        <Send size={15} />
      </button>
    </div>
    {!isStaff && (
      <p className="text-center text-[10px] text-gray-300 pb-2">🔒 Your messages are secure and private</p>
    )}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const [user, setUser]               = useState<UserData | null>(null);
  const [ready, setReady]             = useState(false);
  const [connected, setConnected]     = useState(false);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [isTyping, setIsTyping]       = useState(false);
  const [typingUser, setTypingUser]   = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv]   = useState<Conversation | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [search, setSearch]           = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  const [showEmoji, setShowEmoji]         = useState(false);
  const [recording, setRecording]         = useState(false);
  const [audioBlob, setAudioBlob]         = useState<Blob | null>(null);
  const [audioURL, setAudioURL]           = useState<string | null>(null);
  const [recordSecs, setRecordSecs]       = useState(0);

  const socketRef      = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedRooms    = useRef<Set<string>>(new Set());
  const activeConvRef    = useRef<Conversation | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);
  const recordTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep activeConvRef in sync
  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

  // ── Theme sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    const apply = () => {
      const t = localStorage.getItem("theme") || "light";
      document.documentElement.setAttribute("data-theme", t);
    };
    apply();
    const iv = setInterval(apply, 500);
    return () => clearInterval(iv);
  }, []);

  // ── Load user + connect socket ────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) return;
    const u: UserData = JSON.parse(saved);
    setUser(u);
    setReady(true);

    const myId    = u._id || u.email;
    const isStaff = STAFF_ROLES.includes(u.role);
    const socket  = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("user:join", { userId: myId, userName: u.name, userRole: u.role });
      if (!isStaff) {
        const room = getRoomId(myId);
        socket.emit("room:join", { roomId: room, userId: myId });
        joinedRooms.current.add(room);
      }
    });

    socket.on("disconnect", () => setConnected(false));

    // ✅ MongoDB user list — no duplicate with users:online
    socket.on("users:list", (list: { _id: string; name: string; email: string; photoURL?: string; role: string }[]) => {
      if (!isStaff) return;
      setConversations(prev => {
        const map = new Map(prev.map(c => [c.userId, c]));
        list.forEach(u2 => {
          if (!map.has(u2._id)) {
            map.set(u2._id, {
              userId:      u2._id,
              userName:    u2.name,
              userRole:    u2.role,
              photoURL:    u2.photoURL,
              roomId:      getRoomId(u2._id),
              lastMessage: "",
              lastTime:    "",
              unread:      0,
              online:      false,
            });
          } else {
            // Update photoURL if missing
            const existing = map.get(u2._id)!;
            if (!existing.photoURL && u2.photoURL) {
              map.set(u2._id, { ...existing, photoURL: u2.photoURL });
            }
          }
        });
        return Array.from(map.values());
      });
    });

    socket.on("room:history", (history: Message[]) => {
      setMessages(history);
      if (history.length > 0) {
        const last = history[history.length - 1];
        setConversations(prev => prev.map(c =>
          c.roomId === last.roomId ? {
            ...c,
            lastMessage: last.content,
            lastTime: formatTime(last.createdAt),
          } : c
        ));
      }
    });

    socket.on("message:receive", (msg: Message) => {
      if (!isStaff) {
        if (msg.roomId === getRoomId(myId)) setMessages(p => [...p, msg]);
        return;
      }
      // Use ref to avoid stale closure
      if (activeConvRef.current?.roomId === msg.roomId) {
        setMessages(p => [...p, msg]);
      }
      setConversations(prev => prev.map(c =>
        c.roomId === msg.roomId ? {
          ...c,
          lastMessage: msg.content,
          lastTime: formatTime(msg.createdAt),
          unread: activeConvRef.current?.roomId === msg.roomId ? 0 : c.unread + 1,
        } : c
      ));
    });

    // ✅ users:online — ONLY update online status, never add users
    socket.on("users:online", (users: OnlineUser[]) => {
      setOnlineUsers(users);
      const onlineIds = new Set(users.map((u2: OnlineUser) => u2.userId));
      setConversations(prev => prev.map(c => ({
        ...c, online: onlineIds.has(c.userId),
      })));
    });

    socket.on("typing:show", ({ userName }: { userName: string }) => {
      setIsTyping(true); setTypingUser(userName);
    });
    socket.on("typing:hide", () => { setIsTyping(false); setTypingUser(""); });

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Emoji ────────────────────────────────────────────────────────────────
  const addEmoji = (emoji: string) => {
    setInput(prev => { inputRef.current = prev + emoji; return prev + emoji; });
    setShowEmoji(false);
  };

  // ── Voice recording ───────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setRecording(true);
      setRecordSecs(0);
      recordTimerRef.current = setInterval(() => setRecordSecs(s => s + 1), 1000);
    } catch {
      alert("Microphone permission denied!");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  };

  const cancelVoice = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setRecordSecs(0);
  };

  const sendVoice = () => {
    if (!audioBlob || !socketRef.current) return;
    const u = JSON.parse(localStorage.getItem("user") || "{}") as UserData;
    const myId    = u._id || u.email;
    const isStaff = STAFF_ROLES.includes(u.role);
    const roomId  = isStaff ? activeConvRef.current?.roomId : getRoomId(myId);
    if (!roomId) return;

    // Convert blob to base64 and send via socket
    const reader = new FileReader();
    reader.onloadend = () => {
      socketRef.current?.emit("message:send", {
        roomId, senderId: myId, senderName: u.name,
        senderRole: u.role, content: "🎤 Voice message",
        messageType: "voice", voiceData: reader.result,
      });
    };
    reader.readAsDataURL(audioBlob);
    cancelVoice();
  };

  const emitTyping = useCallback((roomId: string, name: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("typing:start", { roomId, userName: name });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit("typing:stop", { roomId });
    }, 2000);
  }, []);

  const inputRef = useRef("");

  const sendMessage = useCallback(() => {
    const content = inputRef.current.trim();
    if (!content || !socketRef.current) return;
    const u = JSON.parse(localStorage.getItem("user") || "{}") as UserData;
    const myId    = u._id || u.email;
    const isStaff = STAFF_ROLES.includes(u.role);
    const roomId  = isStaff ? activeConvRef.current?.roomId : getRoomId(myId);
    if (!roomId) return;
    socketRef.current.emit("message:send", {
      roomId, senderId: myId, senderName: u.name,
      senderRole: u.role, content,
    });
    socketRef.current.emit("typing:stop", { roomId });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setInput("");
    inputRef.current = "";
  }, []);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    inputRef.current = e.target.value;
    const u = JSON.parse(localStorage.getItem("user") || "{}") as UserData;
    if (!u?.name) return;
    const myId    = u._id || u.email;
    const isStaff = STAFF_ROLES.includes(u.role);
    const roomId  = isStaff ? activeConvRef.current?.roomId : getRoomId(myId);
    if (roomId) emitTyping(roomId, u.name);
  }, [emitTyping]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  }, [sendMessage]);

  const openConv = useCallback((conv: Conversation) => {
    setActiveConv(conv);
    activeConvRef.current = conv;
    setMessages([]);
    setIsTyping(false);
    setShowSidebar(false);
    setConversations(prev => prev.map(c => c.userId === conv.userId ? { ...c, unread: 0 } : c));
    // ✅ Always re-join room for real-time
    if (socketRef.current) {
      socketRef.current.emit("room:join", {
        roomId: conv.roomId,
        userId: JSON.parse(localStorage.getItem("user") || "{}")?._id
      });
    }
  }, []);

  if (!ready) return null;

  const isStaff       = STAFF_ROLES.includes(user?.role || "");
  const myId          = user?._id || user?.email || "";
  const myAvatar      = getAvatar(user?.name || "Me", user?.photoURL, isStaff ? "4f46e5" : "e11d48");
  const supportAvatar = getAvatar("Support Team", undefined, "4f46e5");
  const totalUnread   = conversations.reduce((a, c) => a + c.unread, 0);
  const filteredConvs = conversations.filter(c =>
    c.userName.toLowerCase().includes(search.toLowerCase())
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STUDENT VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (!isStaff) {
    return (
      <div className="p-4 md:p-6 flex items-start justify-center">
        <div className="w-full max-w-2xl flex flex-col bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
          style={{ height: "calc(100vh - 130px)" }}>

          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-indigo-100">
                  <img src={supportAvatar} alt="Support" className="w-full h-full object-cover" />
                </div>
                {connected && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <Headphones size={13} className="text-indigo-600" /> Support Team
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  {connected
                    ? <><Circle size={6} className="fill-emerald-500 text-emerald-500" /> Online — replies within minutes</>
                    : "Connecting..."}
                </p>
              </div>
            </div>
            <div className={`text-xs font-bold px-3 py-1 rounded-full text-white ${connected ? "bg-emerald-500" : "bg-gray-400"}`}>
              {connected ? "Live" : "Offline"}
            </div>
          </div>

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center bg-gray-50">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl">💬</div>
              <div>
                <p className="font-bold text-gray-800 mb-1">How can we help you?</p>
                <p className="text-sm text-gray-400">Send a message and our team will reply shortly.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Question about my course", "Payment issue", "Technical problem"].map(p => (
                  <button key={p} onClick={() => setInput(p)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
              {messages.map((msg, i) => (
                <MsgBubble key={msg._id || i} msg={msg}
                  fromMe={msg.senderId === myId}
                  avatar={msg.senderId === myId ? myAvatar : supportAvatar}
                  name={msg.senderId === myId ? (user?.name || "You") : msg.senderName}
                />
              ))}
              {isTyping && <TypingBubble name={typingUser} />}
              <div ref={messagesEndRef} />
            </div>
          )}

          <InputBar
            input={input} onChange={handleInput} onKeyDown={handleKeyDown}
            onSend={sendMessage} connected={connected} isStaff={false}
            placeholder="Type your message here..."
            showEmoji={showEmoji} onToggleEmoji={() => setShowEmoji(v => !v)} onAddEmoji={addEmoji}
            recording={recording} recordSecs={recordSecs}
            onStartRecord={startRecording} onStopRecord={stopRecording}
            audioURL={audioURL} onSendVoice={sendVoice} onCancelVoice={cancelVoice}
          />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STAFF VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-0 md:p-4 lg:p-6">
      <div className="flex bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
        style={{ height: "calc(100vh - 120px)" }}>

        {/* Sidebar */}
        <div className={`${showSidebar ? "flex" : "hidden"} md:flex flex-col w-full md:w-[300px] lg:w-[340px] bg-white border-r border-gray-100 flex-shrink-0`}>
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users size={16} className="text-red-500" />
                Messages
                {totalUnread > 0 && (
                  <span className="w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </h2>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${connected ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                <Circle size={5} className={connected ? "fill-emerald-500" : "fill-gray-400"} />
                {connected ? "Live" : "Off"}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
              <Search size={13} className="text-gray-400 flex-shrink-0" />
              <input type="text" placeholder="Search..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                <Users size={28} className="opacity-30" />
                <p className="text-xs font-medium">{conversations.length === 0 ? "Waiting for users..." : "No results"}</p>
              </div>
            )}
            {filteredConvs.map(conv => (
              <ContactItem key={conv.userId} conv={conv}
                active={activeConv?.userId === conv.userId}
                onClick={() => openConv(conv)} />
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeConv && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center bg-gray-50">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Headphones size={28} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-1 capitalize">{user?.role} Dashboard</p>
                <p className="text-sm text-gray-400">Select a conversation to start replying</p>
              </div>
              <div className="flex gap-8 mt-2">
                {[
                  { label: "Total",  value: conversations.length,                                            color: "text-indigo-600" },
                  { label: "Online", value: onlineUsers.filter(u2 => !STAFF_ROLES.includes(u2.role)).length, color: "text-emerald-600" },
                  { label: "Unread", value: totalUnread,                                                     color: "text-red-500" },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeConv && (
            <>
              <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button className="md:hidden text-gray-500 hover:text-gray-700 mr-1"
                    onClick={() => setShowSidebar(true)}>←</button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100">
                      <img src={getAvatar(activeConv.userName, activeConv.photoURL)}
                        alt={activeConv.userName} className="w-full h-full object-cover" />
                    </div>
                    {activeConv.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{activeConv.userName}</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      {isTyping
                        ? <span className="text-indigo-500 font-medium">Typing...</span>
                        : activeConv.online
                          ? <><Circle size={7} className="fill-emerald-500 text-emerald-500" /> Online</>
                          : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <Search size={15} />
                  </button>
                  <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <MoreVertical size={15} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                    <span className="text-4xl">💬</span>
                    <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <MsgBubble key={msg._id || i} msg={msg}
                    fromMe={msg.senderId === myId}
                    avatar={msg.senderId === myId ? myAvatar : getAvatar(activeConv.userName, activeConv.photoURL)}
                    name={msg.senderId === myId ? (user?.name || "You") : activeConv.userName}
                  />
                ))}
                {isTyping && <TypingBubble name={typingUser} />}
                <div ref={messagesEndRef} />
              </div>

              <InputBar
                input={input} onChange={handleInput} onKeyDown={handleKeyDown}
                onSend={sendMessage} connected={connected} isStaff={true}
                placeholder="Type your message here..."
                showEmoji={showEmoji} onToggleEmoji={() => setShowEmoji(v => !v)} onAddEmoji={addEmoji}
                recording={recording} recordSecs={recordSecs}
                onStartRecord={startRecording} onStopRecord={stopRecording}
                audioURL={audioURL} onSendVoice={sendVoice} onCancelVoice={cancelVoice}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}