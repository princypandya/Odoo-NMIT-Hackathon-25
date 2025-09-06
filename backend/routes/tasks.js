/*
 * Task Routes
 * Handles CRUD operations for tasks
 */

const express = require("express")
const router = express.Router()
const Task = require("../models/Task")
const Project = require("../models/Project")
const { authenticateToken } = require("../middleware/auth")

// Apply authentication middleware to all routes
router.use(authenticateToken)

// GET /api/projects/:projectId/tasks - Get project tasks
router.get("/projects/:projectId/tasks", async (req, res) => {
  try {
    const { projectId } = req.params
    const userId = req.user.uid

    // Verify user has access to project
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ createdBy: userId }, { "members.userId": userId }],
    })

    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const tasks = await Task.find({ projectId }).sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    res.status(500).json({ message: "Failed to fetch tasks" })
  }
})

// POST /api/projects/:projectId/tasks - Create new task
router.post("/projects/:projectId/tasks", async (req, res) => {
  try {
    const { projectId } = req.params
    const userId = req.user.uid
    const { title, description, assignedTo, dueDate, priority, tags } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" })
    }

    // Verify user has access to project
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ createdBy: userId }, { "members.userId": userId }],
    })

    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const task = new Task({
      title: title.trim(),
      description: description?.trim() || "",
      projectId,
      assignedTo: assignedTo || null,
      assignedBy: userId,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "medium",
      tags: tags || [],
    })

    await task.save()

    // Emit real-time update
    if (req.io) {
      req.io.to(projectId).emit("taskCreated", task)
    }

    res.status(201).json(task)
  } catch (error) {
    console.error("Error creating task:", error)
    res.status(500).json({ message: "Failed to create task" })
  }
})

// GET /api/tasks/:id - Get task details
router.get("/:id", async (req, res) => {
  try {
    const taskId = req.params.id
    const userId = req.user.uid

    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Verify user has access to project
    const project = await Project.findOne({
      _id: task.projectId,
      $or: [{ createdBy: userId }, { "members.userId": userId }],
    })

    if (!project) {
      return res.status(404).json({ message: "Task not found" })
    }

    res.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    res.status(500).json({ message: "Failed to fetch task" })
  }
})

// PUT /api/tasks/:id - Update task
router.put("/:id", async (req, res) => {
  try {
    const taskId = req.params.id
    const userId = req.user.uid
    const updates = req.body

    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Verify user has access to project
    const project = await Project.findOne({
      _id: task.projectId,
      $or: [{ createdBy: userId }, { "members.userId": userId }],
    })

    if (!project) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Update allowed fields
    const allowedUpdates = ["title", "description", "assignedTo", "status", "priority", "dueDate", "tags"]
    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        if (field === "dueDate" && updates[field]) {
          task[field] = new Date(updates[field])
        } else {
          task[field] = updates[field]
        }
      }
    })

    await task.save()

    // Emit real-time update
    if (req.io) {
      req.io.to(task.projectId.toString()).emit("taskUpdated", task)
    }

    res.json(task)
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({ message: "Failed to update task" })
  }
})

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id
    const userId = req.user.uid

    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Verify user has access to project and permission to delete
    const project = await Project.findOne({
      _id: task.projectId,
      $or: [{ createdBy: userId }, { "members.userId": userId, "members.role": { $in: ["owner", "admin"] } }],
    })

    if (!project && task.assignedBy !== userId) {
      return res.status(403).json({ message: "Insufficient permissions" })
    }

    await Task.findByIdAndDelete(taskId)

    // Emit real-time update
    if (req.io) {
      req.io.to(task.projectId.toString()).emit("taskDeleted", { taskId })
    }

    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({ message: "Failed to delete task" })
  }
})

// POST /api/tasks/:id/comments - Add comment to task
router.post("/:id/comments", async (req, res) => {
  try {
    const taskId = req.params.id
    const userId = req.user.uid
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" })
    }

    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Verify user has access to project
    const project = await Project.findOne({
      _id: task.projectId,
      $or: [{ createdBy: userId }, { "members.userId": userId }],
    })

    if (!project) {
      return res.status(404).json({ message: "Task not found" })
    }

    const comment = {
      userId,
      userName: req.user.name,
      content: content.trim(),
      createdAt: new Date(),
    }

    task.comments.push(comment)
    await task.save()

    // Emit real-time update
    if (req.io) {
      req.io.to(task.projectId.toString()).emit("taskCommentAdded", {
        taskId,
        comment,
      })
    }

    res.status(201).json(comment)
  } catch (error) {
    console.error("Error adding comment:", error)
    res.status(500).json({ message: "Failed to add comment" })
  }
})

module.exports = router
