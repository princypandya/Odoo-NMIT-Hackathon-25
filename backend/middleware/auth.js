/*
 * Firebase Authentication Middleware
 * Verifies Firebase ID tokens for protected routes
 * Learn more: https://firebase.google.com/docs/auth/admin/verify-id-tokens
 */

const admin = require("../config/firebase")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Access token required" })
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token)

    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email,
    }

    next()
  } catch (error) {
    console.error("Token verification error:", error)
    return res.status(403).json({ message: "Invalid or expired token" })
  }
}

module.exports = { authenticateToken }
