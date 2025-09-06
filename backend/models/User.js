/*
 * User Model Schema
 * Defines user data structure in MongoDB
 * Learn more: https://mongoosejs.com/docs/guide.html
 */

const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        taskUpdates: { type: Boolean, default: true },
        projectUpdates: { type: Boolean, default: true },
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
userSchema.index({ firebaseUid: 1 })
userSchema.index({ email: 1 })

module.exports = mongoose.model("User", userSchema)
