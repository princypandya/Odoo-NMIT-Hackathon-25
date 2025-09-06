/*
 * Message Routes
 * Handles chat messages and real-time communication
 */

const express = require("express")
const router = express.Router()
const Message = require("../models/Message")
const Project = require("../models/Project")
const { authenticateToken } = require("../middleware/auth")

// Apply authentication middleware to all routes
router.use(authenticateToken)

// GET /api/projects/:projectId/messages - Get project messages
router.get("/projects/:projectId/messages", async (req, res) => {
  try {
    const { projectId } = req.params
    const userId = req.user.uid
    const { page = 1, limit = 50 } = req.query

    // Verify user has access to project
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ createdBy: userId }, { "members.userId": userId }],
    })

    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const messages = await Message.find({ projectId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("replyTo", "content userName createdAt")

    // Reverse to show oldest first
    messages.reverse()

    res.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({ message: "Failed to fetch messages" })
  }
})

// POST /api/projects/:projectId/messages - Send message
router.post("/projects/:projectId/messages", async (req, res) => {
  try {
    const { projectId } = req.params
    const userId = req.user.uid
    const { content, type = "text", replyTo, mentions } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" })
    }

    // Verify user has access to project
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ createdBy: userId }, { "members.userId": userId }],
    })

    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const message = new Message({
      projectId,
      userId,
      userName: req.user.name,
      content: content.trim(),
      type,
      replyTo: replyTo || null,
      mentions: mentions || [],
    })

    await message.save()

    // Populate reply if exists
    if (replyTo) {
      await message.populate("replyTo", "content userName createdAt")
    }

    // Emit real-time update
    if (req.io) {
      req.io.to(projectId).emit("receiveMessage", message)
    }

    res.status(201).json(message)
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({ message: "Failed to send message" })
  }
})

// PUT /api/messages/:id - Edit message
router.put("/:id", async (req, res) => {
  try {
    const messageId = req.params.id
    const userId = req.user.uid
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" })
    }

    const message = await Message.findById(messageId)
    if (!message) {
      return res.status(404).json({ message: "Message not found" })
    }

    // Only allow user to edit their own messages
    if (message.userId !== userId) {
      return res.status(403).json({ message: "You can only edit your own messages" })
    }

    // Store original content if not already edited
    if (!message.edited.isEdited) {
      message.edited.originalContent = message.content
    }

    message.content = content.trim()
    message.edited.isEdited = true
    message.edited.editedAt = new Date()

    await message.save()

    // Emit real-time update
    if (req.io) {
      req.io.to(message.projectId.toString()).emit("messageEdited", message)
    }

    res.json(message)
  } catch (error) {
    console.error("Error editing message:", error)
    res.status(500).json({ message: "Failed to edit message" })
  }
})

// DELETE /api/messages/:id - Delete message
router.delete("/:id", async (req, res) => {
  try {
    const messageId = req.params.id
    const userId = req.user.uid

    const message = await Message.findById(messageId)
    if (!message) {
      return res.status(404).json({ message: "Message not found" })
    }

    // Allow user to delete their own messages or project admins
    const project = await Project.findById(message.projectId)
    const isAdmin = project.members.some(
      (member) => member.userId === userId && ["owner", "admin"].includes(member.role),
    )

    if (message.userId !== userId && !isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" })
    }

    await Message.findByIdAndDelete(messageId)

    // Emit real-time update
    if (req.io) {
      req.io.to(message.projectId.toString()).emit("messageDeleted", { messageId })
    }

    res.json({ message: "Message deleted successfully" })
  } catch (error) {
    console.error("Error deleting message:", error)
    res.status(500).json({ message: "Failed to delete message" })
  }
})

// POST /api/messages/:id/reactions - Add reaction to message
router.post("/:id/reactions", async (req, res) => {
  try {
    const messageId = req.params.id
    const userId = req.user.uid
    const { emoji } = req.body

    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" })
    }

    const message = await Message.findById(messageId)
    if (!message) {
      return res.status(404).json({ message: "Message not found" })
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find((r) => r.userId === userId && r.emoji === emoji)

    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter((r) => !(r.userId === userId && r.emoji === emoji))
    } else {
      // Add reaction
      message.reactions.push({
        userId,
        emoji,
        createdAt: new Date(),
      })
    }

    await message.save()

    // Emit real-time update
    if (req.io) {
      req.io.to(message.projectId.toString()).emit("messageReactionUpdated", {
        messageId,
        reactions: message.reactions,
      })
    }

    res.json({ reactions: message.reactions })
  } catch (error) {
    console.error("Error updating reaction:", error)
    res.status(500).json({ message: "Failed to update reaction" })
  }
})

module.exports = router
