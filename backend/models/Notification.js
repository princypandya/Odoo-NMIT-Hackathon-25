/*
 * Notification Model Schema
 * Defines notification data structure in MongoDB
 */

const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Firebase UID
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_completed",
        "task_updated",
        "message_mention",
        "project_invite",
        "member_joined",
        "deadline_reminder",
        "project_updated",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      fromUserId: String,
      fromUserName: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
notificationSchema.index({ userId: 1, read: 1 })
notificationSchema.index({ projectId: 1 })
notificationSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Notification", notificationSchema)
