const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// GET messages by room
router.get("/:room", async (req, res) => {
  try {
    const messages = await Message.find({
      room: req.params.room.toString()
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;