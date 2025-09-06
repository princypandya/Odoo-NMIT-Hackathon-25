/*
 * Message Model Schema
 * Defines chat message data structure in MongoDB
 */

const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: String, // Firebase UID
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "file", "system"],
      default: "text",
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    mentions: [
      {
        userId: String,
        userName: String,
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    reactions: [
      {
        userId: String,
        emoji: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    edited: {
      isEdited: { type: Boolean, default: false },
      editedAt: Date,
      originalContent: String,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
messageSchema.index({ projectId: 1, createdAt: -1 })
messageSchema.index({ userId: 1 })

module.exports = mongoose.model("Message", messageSchema)
