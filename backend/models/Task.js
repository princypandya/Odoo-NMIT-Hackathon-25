/*
 * Task Model Schema
 * Defines task data structure in MongoDB
 */

const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: String, // Firebase UID
      default: null,
    },
    assignedBy: {
      type: String, // Firebase UID
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        userId: String,
        userName: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
taskSchema.index({ projectId: 1 })
taskSchema.index({ assignedTo: 1 })
taskSchema.index({ status: 1 })
taskSchema.index({ dueDate: 1 })

// Update completedAt when status changes to done
taskSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "done" && !this.completedAt) {
      this.completedAt = new Date()
    } else if (this.status !== "done") {
      this.completedAt = null
    }
  }
  next()
})

module.exports = mongoose.model("Task", taskSchema)
