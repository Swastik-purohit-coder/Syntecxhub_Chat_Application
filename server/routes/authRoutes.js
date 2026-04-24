const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("All fields required");
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json("Invalid email format");
  }

  if (password.length < 6) {
    return res.status(400).json("Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json("User already exists");
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashed,
  });

  res.json(user);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("All fields required");
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json("Invalid email format");
  }

  if (password.length < 6) {
    return res.status(400).json("Password must be at least 6 characters");
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json("Wrong password");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ token, username: user.username });
});

module.exports = router;