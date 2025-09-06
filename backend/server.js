/*
 * Express Server with Socket.IO for SynergySphere
 * Handles API routes and real-time communication
 * Learn more: https://expressjs.com/en/starter/hello-world.html
 * Socket.IO: https://socket.io/docs/v4/
 */

const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const connectDB = require("./config/db")
require("dotenv").config()

// Import routes
const projectRoutes = require("./routes/projects")
const taskRoutes = require("./routes/tasks")
const messageRoutes = require("./routes/messages")
const { router: notificationRoutes, createNotification } = require("./routes/notifications")

const app = express()
const server = http.createServer(app)

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Connect to MongoDB
connectDB()

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io
  next()
})

// Routes
app.use("/api/projects", projectRoutes)
app.use("/api", taskRoutes) // Added task routes
app.use("/api/messages", messageRoutes)
app.use("/api/notifications", notificationRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "SynergySphere API is running" })
})

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  let currentProjectId = null
  let currentUserId = null
  const onlineUsers = new Map()

  // Join project room for real-time updates
  socket.on("joinProject", (projectId) => {
    if (currentProjectId) {
      socket.leave(currentProjectId)
    }
    socket.join(projectId)
    currentProjectId = projectId
    console.log(`User ${socket.id} joined project ${projectId}`)
  })

  socket.on("joinUserRoom", (userId) => {
    socket.join(`user_${userId}`)
    currentUserId = userId
    console.log(`User ${socket.id} joined user room ${userId}`)
  })

  socket.on("userOnline", (data) => {
    const { projectId, userId, userName } = data
    onlineUsers.set(userId, { userId, userName, lastSeen: new Date() })
    io.to(projectId).emit("onlineUsersUpdate", Array.from(onlineUsers.values()))
  })

  socket.on("userOffline", (data) => {
    const { userId } = data
    onlineUsers.delete(userId)
    if (currentProjectId) {
      io.to(currentProjectId).emit("onlineUsersUpdate", Array.from(onlineUsers.values()))
    }
  })

  socket.on("startTyping", (data) => {
    const { projectId, userId, userName } = data
    socket.to(projectId).emit("userTyping", { userId, userName })
  })

  socket.on("stopTyping", (data) => {
    const { projectId, userId } = data
    socket.to(projectId).emit("userStoppedTyping", { userId })
  })

  // Handle chat messages
  socket.on("sendMessage", async (data) => {
    try {
      const { projectId, message, userId, userName } = data

      // Save message to database
      const Message = require("./models/Message")
      const newMessage = new Message({
        projectId,
        userId,
        userName,
        content: message,
        timestamp: new Date(),
      })
      await newMessage.save()

      // Broadcast to project room
      io.to(projectId).emit("receiveMessage", {
        _id: newMessage._id,
        projectId,
        userId,
        userName,
        content: message,
        timestamp: newMessage.timestamp,
      })
    } catch (error) {
      console.error("Error sending message:", error)
    }
  })

  // Handle task updates
  socket.on("taskUpdated", (data) => {
    const { projectId, task } = data
    io.to(projectId).emit("taskUpdated", task)
  })

  // Handle notifications
  socket.on("sendNotification", (data) => {
    const { projectId, notification } = data
    io.to(projectId).emit("newNotification", notification)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
    if (currentUserId) {
      onlineUsers.delete(currentUserId)
      if (currentProjectId) {
        io.to(currentProjectId).emit("onlineUsersUpdate", Array.from(onlineUsers.values()))
      }
    }
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`SynergySphere server running on port ${PORT}`)
})

module.exports = { app, io }
