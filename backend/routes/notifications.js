/*
 * Notification Routes
 * Handles real-time notifications
 */

const express = require("express")
const router = express.Router()
const Notification = require("../models/Notification")
const Project = require("../models/Project")
const { authenticateToken } = require("../middleware/auth")

// Apply authentication middleware to all routes
router.use(authenticateToken)

// GET /api/notifications - Get user notifications
router.get("/", async (req, res) => {
  try {
    const userId = req.user.uid
    const { page = 1, limit = 20, unreadOnly = false } = req.query

    const filter = { userId }
    if (unreadOnly === "true") {
      filter.read = false
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("projectId", "name")
      .populate("data.taskId", "title")

    const unreadCount = await Notification.countDocuments({ userId, read: false })

    res.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === limit,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ message: "Failed to fetch notifications" })
  }
})

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/:id/read", async (req, res) => {
  try {
    const notificationId = req.params.id
    const userId = req.user.uid

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true, readAt: new Date() },
      { new: true },
    )

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json(notification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ message: "Failed to update notification" })
  }
})

// PUT /api/notifications/read-all - Mark all notifications as read
router.put("/read-all", async (req, res) => {
  try {
    const userId = req.user.uid

    await Notification.updateMany({ userId, read: false }, { read: true, readAt: new Date() })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    res.status(500).json({ message: "Failed to update notifications" })
  }
})

// POST /api/notifications - Create notification (internal use)
router.post("/", async (req, res) => {
  try {
    const { userId, projectId, type, title, message, data } = req.body

    // Verify project exists and user has access
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const notification = new Notification({
      userId,
      projectId,
      type,
      title,
      message,
      data: data || {},
    })

    await notification.save()

    // Emit real-time notification
    if (req.io) {
      req.io.to(`user_${userId}`).emit("newNotification", notification)
    }

    res.status(201).json(notification)
  } catch (error) {
    console.error("Error creating notification:", error)
    res.status(500).json({ message: "Failed to create notification" })
  }
})

// Helper function to create notifications
const createNotification = async (io, { userId, projectId, type, title, message, data = {} }) => {
  try {
    const notification = new Notification({
      userId,
      projectId,
      type,
      title,
      message,
      data,
    })

    await notification.save()

    // Emit real-time notification
    if (io) {
      io.to(`user_${userId}`).emit("newNotification", notification)
    }

    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
  }
}

module.exports = { router, createNotification }
