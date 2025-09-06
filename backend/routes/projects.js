/*
 * Project Routes
 * Handles CRUD operations for projects
 * Learn more: https://expressjs.com/en/guide/routing.html
 */

const express = require("express")
const router = express.Router()
const Project = require("../models/Project")
const User = require("../models/User")
const { authenticateToken } = require("../middleware/auth")

// Apply authentication middleware to all routes
router.use(authenticateToken)

// GET /api/projects - Get user's projects
router.get("/", async (req, res) => {
  try {
    const userId = req.user.uid
    console.log("[v0] Fetching projects for user:", userId)

    // Find projects where user is a member or creator
    const projects = await Project.find({
      $or: [{ createdBy: userId }, { "members.userId": userId }],
    }).sort({ updatedAt: -1 })

    console.log("[v0] Found projects:", projects.length)
    console.log(
      "[v0] Project details:",
      projects.map((p) => ({
        id: p._id,
        name: p.name,
        createdBy: p.createdBy,
        members: p.members.map((m) => ({ userId: m.userId, role: m.role })),
      })),
    )

    // Get task statistics for each project
    const Task = require("../models/Task")
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ projectId: project._id })
        const taskStats = {
          total: tasks.length,
          completed: tasks.filter((t) => t.status === "done").length,
          inProgress: tasks.filter((t) => t.status === "in-progress").length,
        }
        return { ...project.toObject(), taskStats }
      }),
    )

    res.json(projectsWithStats)
  } catch (error) {
    console.error("Error fetching projects:", error)
    res.status(500).json({ message: "Failed to fetch projects" })
  }
})

// POST /api/projects - Create new project
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body
    const userId = req.user.uid

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Project name is required" })
    }

    // Create or update user record
    await User.findOneAndUpdate(
      { firebaseUid: userId },
      {
        firebaseUid: userId,
        email: req.user.email,
        displayName: req.user.name,
        lastActive: new Date(),
      },
      { upsert: true, new: true },
    )

    const project = new Project({
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: userId,
      members: [
        {
          userId,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    })

    await project.save()

    // Return project with task stats
    const projectWithStats = {
      ...project.toObject(),
      taskStats: { total: 0, completed: 0, inProgress: 0 },
    }

    res.status(201).json(projectWithStats)
  } catch (error) {
    console.error("Error creating project:", error)
    res.status(500).json({ message: "Failed to create project" })
  }
})

// GET /api/projects/:id - Get project details
router.get("/:id", async (req, res) => {
  try {
    const projectId = req.params.id
    const userId = req.user.uid

    const project = await Project.findOne({
      _id: projectId,
      $or: [{ createdBy: userId }, { "members.userId": userId }],
    })

    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    // Get task statistics
    const Task = require("../models/Task")
    const tasks = await Task.find({ projectId: project._id })
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "done").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
    }

    res.json({ ...project.toObject(), taskStats })
  } catch (error) {
    console.error("Error fetching project:", error)
    res.status(500).json({ message: "Failed to fetch project" })
  }
})

// PUT /api/projects/:id - Update project
router.put("/:id", async (req, res) => {
  try {
    const projectId = req.params.id
    const userId = req.user.uid
    const { name, description } = req.body

    const project = await Project.findOne({
      _id: projectId,
      $or: [{ createdBy: userId }, { "members.userId": userId, "members.role": { $in: ["owner", "admin"] } }],
    })

    if (!project) {
      return res.status(404).json({ message: "Project not found or insufficient permissions" })
    }

    if (name) project.name = name.trim()
    if (description !== undefined) project.description = description.trim()

    await project.save()

    res.json(project)
  } catch (error) {
    console.error("Error updating project:", error)
    res.status(500).json({ message: "Failed to update project" })
  }
})

// DELETE /api/projects/:id - Delete project
router.delete("/:id", async (req, res) => {
  try {
    const projectId = req.params.id
    const userId = req.user.uid

    const project = await Project.findOne({
      _id: projectId,
      createdBy: userId, // Only owner can delete
    })

    if (!project) {
      return res.status(404).json({ message: "Project not found or insufficient permissions" })
    }

    await Project.findByIdAndDelete(projectId)

    // Also delete associated tasks and messages
    const Task = require("../models/Task")
    const Message = require("../models/Message")
    await Task.deleteMany({ projectId })
    await Message.deleteMany({ projectId })

    res.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Error deleting project:", error)
    res.status(500).json({ message: "Failed to delete project" })
  }
})

// POST /api/projects/:id/members - Add team member
router.post("/:id/members", async (req, res) => {
  try {
    console.log("[v0] Add member request received:", {
      projectId: req.params.id,
      body: req.body,
      requestingUserId: req.user?.uid,
    })

    const projectId = req.params.id
    const userId = req.user.uid
    const { email, role = "member" } = req.body

    console.log("[v0] Looking for project with ID:", projectId)
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ createdBy: userId }, { "members.userId": userId, "members.role": { $in: ["owner", "admin"] } }],
    })

    if (!project) {
      console.log("[v0] Project not found or insufficient permissions")
      return res.status(404).json({ message: "Project not found or insufficient permissions" })
    }

    console.log("[v0] Project found, resolving email to Firebase UID:", email)
    let targetUserId
    try {
      const admin = require("../config/firebase")
      console.log("[v0] Firebase admin initialized, getting user by email")
      const userRecord = await admin.auth().getUserByEmail(email)
      targetUserId = userRecord.uid
      console.log("[v0] Firebase user found:", { uid: targetUserId, email: userRecord.email })

      console.log("[v0] Creating/updating user record in database")
      const dbUser = await User.findOneAndUpdate(
        { firebaseUid: targetUserId },
        {
          firebaseUid: targetUserId,
          email: userRecord.email,
          displayName: userRecord.displayName || userRecord.email,
          lastActive: new Date(),
        },
        { upsert: true, new: true },
      )
      console.log("[v0] User record created/updated successfully:", {
        dbUserId: dbUser._id,
        firebaseUid: dbUser.firebaseUid,
        email: dbUser.email,
      })
    } catch (firebaseError) {
      console.error("[v0] Firebase error:", firebaseError)
      return res.status(400).json({
        message: "User not found. Please make sure the email is registered in the system.",
      })
    }

    // Check if user is already a member
    const existingMember = project.members.find((m) => m.userId === targetUserId)
    if (existingMember) {
      console.log("[v0] User is already a member")
      return res.status(400).json({ message: "User is already a member of this project" })
    }

    const newMember = {
      userId: targetUserId,
      role,
      joinedAt: new Date(),
    }

    console.log("[v0] Adding new member:", newMember)
    project.members.push(newMember)
    await project.save()
    console.log("[v0] Member added successfully, project saved")

    console.log(
      "[v0] Updated project members:",
      project.members.map((m) => ({
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    )

    const testQuery = await Project.find({
      $or: [{ createdBy: targetUserId }, { "members.userId": targetUserId }],
    })
    console.log("[v0] Test query for new member - found projects:", testQuery.length)

    res.json({ message: "Member added successfully", member: newMember })
  } catch (error) {
    console.error("[v0] Error adding member:", error)
    res.status(500).json({ message: "Failed to add member" })
  }
})

module.exports = router
