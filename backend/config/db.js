/*
 * MongoDB Database Connection
 * Connects to MongoDB using Mongoose
 * Learn more: https://mongoosejs.com/docs/connections.html
 */

const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error("Database connection error:", error.message)
    process.exit(1)
  }
}

module.exports = connectDB
