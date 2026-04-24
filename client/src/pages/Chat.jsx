import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { socket } from "../socket";

const getMessageId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object") {
    if (value.$oid) return String(value.$oid).trim();
    if (value._id) return getMessageId(value._id);
  }

  return String(value).trim();
};

export default function Chat({ user, onLogout }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const bottomRef = useRef(null);
  const safeUser = user?.trim() || "Guest";

  useEffect(() => {
    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleMessageDelete = ({ messageId }) => {
      const deletedId = getMessageId(messageId);
      if (!deletedId) return;

      setMessages((prev) => prev.filter((msg) => getMessageId(msg._id) !== deletedId));
    };

    socket.on("receive_message", handleMessage);
    socket.on("message_deleted", handleMessageDelete);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("message_deleted", handleMessageDelete);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinRoom = async () => {
    const selectedRoom = room.trim();
    if (!selectedRoom) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_room", selectedRoom);
    setRoom(selectedRoom);
    setJoined(true);
    setMessages([]);

    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${selectedRoom}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const sendMessage = () => {
    if (!joined) {
      alert("Join a room first!");
      return;
    }

    const text = message.trim();
    if (!text) return;

    const data = {
      room: room.trim(),
      sender: safeUser,
      message: text,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("send_message", data);
    setMessage("");
  };

  const deleteMessage = (msg) => {
    if (!joined || !msg?._id) return;

    const messageId = getMessageId(msg._id);
    if (!messageId) return;

    socket.emit(
      "delete_message",
      {
        room: String(msg.room || room).trim(),
        messageId,
        sender: String(msg.sender || safeUser || "").trim(),
        message: String(msg.message || "").trim(),
        time: String(msg.time || "").trim(),
      },
      (response) => {
        if (!response?.ok) {
          alert(`Failed to delete message: ${response?.error || "Unknown error"}`);
          return;
        }

        const deletedId = getMessageId(response.messageId || messageId);
        setMessages((prev) => prev.filter((item) => getMessageId(item._id) !== deletedId));
      }
    );
  };

  const handleRoomKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    joinRoom();
  };

  const handleMessageKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    sendMessage();
  };

  const handleLogoutClick = () => {
    const shouldLogout = window.confirm("Are you sure want to logout?");
    if (!shouldLogout) return;

    onLogout?.();
  };

  return (
    <main className="chat-page">
      <section className="chat-layout">
        <header className="chat-topbar fade-step">
          <div>
            <p className="tag">Realtime Room</p>
            <h1>Conversation Hub</h1>
          </div>
          <div className="topbar-actions">
            <span className="user-chip">{safeUser}</span>
            <button
              type="button"
              className="ghost-btn"
              onClick={handleLogoutClick}
            >
              Logout
            </button>
          </div>
        </header>

        <section className="chat-panel fade-step delay-1">
          <div className="room-controls">
            <label className="input-group room-input">
              <span>Room ID</span>
              <input
                placeholder="Enter room name"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                onKeyDown={handleRoomKeyDown}
              />
            </label>
            <button
              type="button"
              className="primary-btn join-btn"
              onClick={joinRoom}
              disabled={!room.trim()}
            >
              {joined ? "Switch Room" : "Join Room"}
            </button>
          </div>

          <p className="room-status">
            {joined ? (
              <>
                <span className="status-dot"></span>
                Connected to <b>#{room}</b>
              </>
            ) : (
              "Join a room to start live messaging."
            )}
          </p>

          <div className="messages-board">
            {!messages.length ? (
              <div className="empty-state">
                <h3>No messages yet</h3>
                <p>{joined ? "Say hello and start the thread." : "Choose a room, then send your first message."}</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const msgId = getMessageId(msg._id);
                const isOwnMessage = msg.sender === safeUser;

                return (
                  <article key={msgId || `${msg.sender}-${msg.time}-${i}`} className={`message-row ${isOwnMessage ? "own" : "other"}`}>
                    <div className={`message-bubble ${isOwnMessage ? "own" : "other"}`}>
                      <div className="message-meta">
                        <span className="message-sender">{msg.sender || "Unknown"}</span>
                        <span className="message-time">{msg.time || ""}</span>
                      </div>
                      <p className="message-text">{msg.message}</p>
                      {isOwnMessage && msgId && (
                        <button type="button" className="message-delete" onClick={() => deleteMessage(msg)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
            <div ref={bottomRef}></div>
          </div>

          <div className="composer">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleMessageKeyDown}
              placeholder={joined ? "Type your message" : "Join a room first"}
              disabled={!joined}
            />
            <button
              type="button"
              className="primary-btn send-btn"
              onClick={sendMessage}
              disabled={!joined || !message.trim()}
            >
              Send
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}