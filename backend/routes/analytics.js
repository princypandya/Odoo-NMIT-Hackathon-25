const express = require("express")
const router = express.Router()
const { authenticateToken } = require("../middleware/auth")
const Task = require("../models/Task")
const Project = require("../models/Project")
const User = require("../models/User")

// Get dashboard analytics
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid

    // Get user's projects
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    })

    const projectIds = projects.map((p) => p._id)

    // Get tasks for analytics
    const tasks = await Task.find({ project: { $in: projectIds } })

    // Calculate productivity metrics
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const tasksThisWeek = tasks.filter(
      (task) => task.status === "completed" && new Date(task.updatedAt) >= weekAgo,
    ).length

    const tasksLastWeek = tasks.filter(
      (task) =>
        task.status === "completed" && new Date(task.updatedAt) >= twoWeeksAgo && new Date(task.updatedAt) < weekAgo,
    ).length

    // Calculate average completion time
    const completedTasks = tasks.filter((task) => task.status === "completed")
    const avgCompletionTime =
      completedTasks.length > 0
        ? completedTasks.reduce((sum, task) => {
            const created = new Date(task.createdAt)
            const completed = new Date(task.updatedAt)
            return sum + (completed - created) / (1000 * 60 * 60) // hours
          }, 0) / completedTasks.length
        : 0

    // Calculate on-time delivery
    const tasksWithDueDate = tasks.filter((task) => task.dueDate && task.status === "completed")
    const onTimeDelivery =
      tasksWithDueDate.length > 0
        ? (tasksWithDueDate.filter((task) => new Date(task.updatedAt) <= new Date(task.dueDate)).length /
            tasksWithDueDate.length) *
          100
        : 100

    // Get team statistics
    const allMembers = new Set()
    projects.forEach((project) => {
      project.members.forEach((member) => allMembers.add(member))
    })

    // Get top performers
    const memberStats = {}
    tasks
      .filter((task) => task.status === "completed")
      .forEach((task) => {
        if (task.assignee) {
          memberStats[task.assignee] = (memberStats[task.assignee] || 0) + 1
        }
      })

    const topPerformers = await Promise.all(
      Object.entries(memberStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(async ([userId, count]) => {
          const user = await User.findOne({ firebaseUid: userId })
          return {
            name: user?.displayName || user?.email || "Unknown User",
            tasksCompleted: count,
            avatar: user?.photoURL || "",
          }
        }),
    )

    // Project statistics
    const activeProjects = projects.filter((p) => p.status === "active").length
    const completedProjects = projects.filter((p) => p.status === "completed").length

    const projectDurations = projects
      .filter((p) => p.status === "completed" && p.endDate)
      .map((p) => {
        const start = new Date(p.createdAt)
        const end = new Date(p.endDate)
        return (end - start) / (1000 * 60 * 60 * 24) // days
      })

    const avgProjectDuration =
      projectDurations.length > 0
        ? projectDurations.reduce((sum, duration) => sum + duration, 0) / projectDurations.length
        : 0

    // Upcoming deadlines
    const upcomingDeadlines = tasks.filter(
      (task) =>
        task.dueDate &&
        task.status !== "completed" &&
        new Date(task.dueDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    ).length

    const analytics = {
      productivity: {
        tasksCompletedThisWeek: tasksThisWeek,
        tasksCompletedLastWeek: tasksLastWeek,
        averageCompletionTime: Math.round(avgCompletionTime * 10) / 10,
        onTimeDelivery: Math.round(onTimeDelivery),
      },
      team: {
        activeMembers: allMembers.size,
        totalMembers: allMembers.size,
        topPerformers,
      },
      projects: {
        activeProjects,
        completedProjects,
        averageProjectDuration: Math.round(avgProjectDuration),
        upcomingDeadlines,
      },
    }

    res.json(analytics)
  } catch (error) {
    console.error("Analytics error:", error)
    res.status(500).json({ error: "Failed to fetch analytics" })
  }
})

// Get project progress data
router.get("/projects/progress", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid

    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    }).populate("members", "displayName email")

    const projectProgress = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id })

        const totalTasks = tasks.length
        const completedTasks = tasks.filter((t) => t.status === "completed").length
        const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length
        const todoTasks = tasks.filter((t) => t.status === "todo").length

        const now = new Date()
        const overdueTasks = tasks.filter(
          (t) => t.dueDate && t.status !== "completed" && new Date(t.dueDate) < now,
        ).length

        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        return {
          projectId: project._id,
          projectName: project.name,
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overdueTasks,
          teamMembers: project.members.length,
          dueDate: project.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          completionPercentage,
        }
      }),
    )

    res.json(projectProgress)
  } catch (error) {
    console.error("Project progress error:", error)
    res.status(500).json({ error: "Failed to fetch project progress" })
  }
})

module.exports = router
