/*
 * Firebase Admin SDK Configuration
 * Used for verifying Firebase ID tokens on the backend
 * Learn more: https://firebase.google.com/docs/admin/setup
 */

const admin = require("firebase-admin")

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  })
}

module.exports = admin
