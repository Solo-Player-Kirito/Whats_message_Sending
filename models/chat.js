const mongoose = require("mongoose");

// Message Schema
const messageSchema = new mongoose.Schema(
  {
    messaging_product: String,
    to: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["text"],
    },
    text: {
      body: {
        type: String,
        required: true,
      },
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// User Schema
const userSchema = new mongoose.Schema(
  {
    phone: {
      type: Number,
      unique: true, // Ensure phone numbers are unique
      required: true,
    },
    chats:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // Reference to the Message model
    },

  },
  { timestamps: true }
);

const objSchema = new mongoose.Schema({
  res: {
    type: mongoose.Schema.Types.Mixed
  }
})

// Models
const ResMod = mongoose.model("Responses", objSchema)
const Message = mongoose.model("Message", messageSchema);
const User = mongoose.model("User", userSchema);

module.exports = { Message, User, ResMod };
