const Message = require("../models/Message");
const mongoose = require("mongoose");

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

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", (room) => {
      const normalizedRoom = String(room || "").trim();
      if (!normalizedRoom) return;
      socket.join(normalizedRoom);
    });

    socket.on("send_message", async (data) => {
      try {
        const normalizedRoom = String(data?.room || "").trim();
        const normalizedMessage = String(data?.message || "").trim();
        const normalizedSender = String(data?.sender || "").trim();

        if (!normalizedRoom || !normalizedMessage || !normalizedSender) return;

        const savedMessage = await Message.create({
          room: normalizedRoom,
          sender: normalizedSender,
          message: normalizedMessage,
          time: data.time,
        });

        io.to(normalizedRoom).emit("receive_message", {
          _id: String(savedMessage._id),
          room: savedMessage.room,
          sender: savedMessage.sender,
          message: savedMessage.message,
          time: savedMessage.time,
          createdAt: savedMessage.createdAt,
          updatedAt: savedMessage.updatedAt,
        });
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    socket.on("delete_message", async (data, callback) => {
      try {
        const messageId = getMessageId(data?.messageId);

        if (!messageId) {
          if (typeof callback === "function") callback({ ok: false, error: "Invalid message ID" });
          return;
        }

        let deletedMessage = null;

        if (mongoose.Types.ObjectId.isValid(messageId)) {
          deletedMessage = await Message.findByIdAndDelete(messageId);
        }

        if (!deletedMessage) {
          const normalizedRoom = String(data?.room || "").trim();
          const normalizedSender = String(data?.sender || "").trim();
          const normalizedMessage = String(data?.message || "").trim();
          const normalizedTime = String(data?.time || "").trim();

          if (normalizedRoom && normalizedSender && normalizedMessage && normalizedTime) {
            deletedMessage = await Message.findOneAndDelete({
              room: normalizedRoom,
              sender: normalizedSender,
              message: normalizedMessage,
              time: normalizedTime,
            }).sort({ createdAt: -1 });
          }
        }

        if (!deletedMessage) {
          const fallbackRoom = String(data?.room || "").trim();
          if (fallbackRoom) {
            io.to(fallbackRoom).emit("message_deleted", { messageId });
          }

          if (typeof callback === "function") {
            callback({ ok: true, messageId, alreadyDeleted: true });
          }
          return;
        }

        const room = String(deletedMessage.room || data?.room || "").trim();
        if (!room) {
          if (typeof callback === "function") callback({ ok: false, error: "Room not found" });
          return;
        }

        io.to(room).emit("message_deleted", { messageId: String(deletedMessage._id) });

        if (typeof callback === "function") {
          callback({ ok: true, messageId: String(deletedMessage._id) });
        }
      } catch (err) {
        console.error("Error deleting message:", err);
        if (typeof callback === "function") callback({ ok: false, error: "Server error" });
      }
    });
  });
};

module.exports = socketHandler;