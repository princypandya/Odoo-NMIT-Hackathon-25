/*
 * API Client Configuration
 * Axios instance with Firebase token authentication
 * Learn more: https://axios-http.com/docs/intro
 */
import axios from "axios"
import { auth } from "./firebase"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add Firebase token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
