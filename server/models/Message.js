const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  room: String,
  sender: String,
  message: String,
  time: String,
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);