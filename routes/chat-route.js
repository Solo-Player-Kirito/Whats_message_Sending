const { Message, User } = require("../models/chat");
const express = require("express");
const router = express.Router();

// Health Check Route
router.get("/check", (req, res) => {
  res.send("ok");
});

// Get All Chats
router.get("/chats", async (req, res) => {
  try {
    const chats = await Message.find();
    if (!chats || chats.length === 0) {
      return res.status(404).send("No data found");
    }
    res.status(200).json(chats);
  } catch (err) {
    console.error("Error while fetching the data:", err);
    res.status(500).send("Internal server error");
  }
});

// Get Chats by Phone Number (from Message Schema)
router.get("/chats/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).send("Phone number is required");
    }
    const chats = await Message.find({ to: phone });
    if (!chats || chats.length === 0) {
      return res.status(404).send("No chat found for this number");
    }
    res.status(200).json(chats);
  } catch (err) {
    console.error("Error while fetching the data:", err);
    res.status(500).send("Internal server error");
  }
});

// Get User and Populate Chats
router.get("/chat/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).send("Phone number is required");
    }
    const user = await User.findOne({ phone }).populate("chats");
    if (!user || !user.chats.length) {
      return res.status(404).send("No chat found for this number");
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error while fetching the data:", err);
    res.status(500).send("Internal server error");
  }
});

// Send a Message
router.post("/send", async (req, res) => {
  console.log("Request body:", req.body);

  const { messaging_product, to, type, content } = req.body;

  if (!messaging_product || !to || !type || !content) {
    return res.status(400).send("All fields are required");
  }

  const token = process.env.WTP_TOKEN;
  const url = process.env.WTP_URL;

  try {
    // Sending the message to the external service
    const response = await fetch(`${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product,
        to,
        type,
        text: { body: content },
      }),
    });

    const responseData = await response.json();
    console.log("External API Response:", responseData);

    if (!response.ok) {
      return res
        .status(500)
        .json({ message: "Failed to send message", details: responseData });
    }

    // Save message in the database
    const chat = new Message({
      messaging_product,
      to,
      type,
      text: { body: content },
      response: responseData,
    });

    const savedChat = await chat.save();

    // Update the user with the new message
    const user = await User.findOneAndUpdate(
      { phone: to },
      { $push: { chats: savedChat._id } },
      { new: true, upsert: true }
    );

    res
      .status(201)
      .json({ message: "Message sent successfully", chat: savedChat, user });
  } catch (err) {
    console.error("Error while sending the message:", err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
