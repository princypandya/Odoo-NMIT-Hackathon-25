/*
 * Project Model Schema
 * Defines project data structure in MongoDB
 */

const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: String, // Firebase UID
      required: true,
    },
    members: [
      {
        userId: { type: String, required: true }, // Firebase UID
        role: {
          type: String,
          enum: ["owner", "admin", "member"],
          default: "member",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    settings: {
      isPublic: { type: Boolean, default: false },
      allowMemberInvites: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
)

// Virtual for task statistics
projectSchema.virtual("taskStats", {
  ref: "Task",
  localField: "_id",
  foreignField: "projectId",
  count: true,
})

// Index for faster queries
projectSchema.index({ createdBy: 1 })
projectSchema.index({ "members.userId": 1 })

module.exports = mongoose.model("Project", projectSchema)
