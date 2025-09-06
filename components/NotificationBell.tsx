/*
 * Notification Bell Component
 * Shows notification count and dropdown
 */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, Check } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import io from "socket.io-client"

interface Notification {
  _id: string
  title: string
  message: string
  type: "task_assigned" | "task_completed" | "task_updated" | "message_mention" | "project_invite" | "member_joined"
  read: boolean
  createdAt: string
  data?: {
    taskId?: string
    messageId?: string
    fromUserId?: string
    fromUserName?: string
  }
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchNotifications()
      setupRealtimeNotifications()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      if (!user) {
        setLoading(false)
        return
      }

      const response = await api.get("/notifications?limit=10")
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unreadCount || 0)
      setHasError(false)
    } catch (error: any) {
      console.error("Failed to fetch notifications:", error)
      setHasError(true)
      setNotifications([])
      setUnreadCount(0)

      if (error?.response?.status !== 500 && error?.response?.status !== 404) {
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeNotifications = () => {
    try {
      if (hasError) return

      const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000", {
        timeout: 5000,
        forceNew: true,
      })

      socket.emit("joinUserRoom", user?.uid)

      socket.on("newNotification", (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev.slice(0, 9)])
        setUnreadCount((prev) => prev + 1)

        toast({
          title: notification.title,
          description: notification.message,
        })
      })

      socket.on("connect_error", (error) => {
        console.warn("Socket connection failed:", error)
      })

      return () => socket.disconnect()
    } catch (error) {
      console.warn("Failed to setup real-time notifications:", error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (hasError || !user) return

    try {
      await api.put(`/notifications/${notificationId}/read`)
      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    if (hasError || !user) return

    try {
      await api.put("/notifications/read-all")
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && !hasError && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : hasError ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>Unable to load notifications</p>
              <p className="text-xs mt-1">Backend server may not be running</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => markAsRead(notification._id)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {!notification.read && <div className="h-2 w-2 bg-primary rounded-full ml-2 mt-1" />}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
