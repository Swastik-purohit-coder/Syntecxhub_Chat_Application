require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const socketHandler = require("./socket/socket");
const PORT = Number(process.env.PORT) || 5000;

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

socketHandler(io);

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`Server is already running on port ${PORT}. Reuse the existing process.`);
    process.exit(0);
  }

  console.error("Server startup error:", error);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});