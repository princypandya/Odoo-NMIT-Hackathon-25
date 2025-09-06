/*
 * Online Status Component
 * Shows online/offline status of users
 */
"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Circle } from "lucide-react"
import io from "socket.io-client"

interface OnlineUser {
  userId: string
  userName: string
  lastSeen: string
}

interface OnlineStatusProps {
  projectId: string
  currentUserId: string
}

export default function OnlineStatus({ projectId, currentUserId }: OnlineStatusProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000")
    setSocket(newSocket)

    // Join project room
    newSocket.emit("joinProject", projectId)

    // Listen for online users updates
    newSocket.on("onlineUsersUpdate", (users: OnlineUser[]) => {
      setOnlineUsers(users.filter((user) => user.userId !== currentUserId))
    })

    // Send user online status
    newSocket.emit("userOnline", {
      projectId,
      userId: currentUserId,
      userName: "Current User", // This should come from user context
    })

    return () => {
      newSocket.emit("userOffline", { projectId, userId: currentUserId })
      newSocket.disconnect()
    }
  }, [projectId, currentUserId])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (onlineUsers.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
        <span>No one else online</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Circle className="h-3 w-3 fill-green-500 text-green-500" />
        <span className="text-sm text-muted-foreground">{onlineUsers.length} online</span>
      </div>

      <div className="flex -space-x-2">
        <TooltipProvider>
          {onlineUsers.slice(0, 5).map((user) => (
            <Tooltip key={user.userId}>
              <TooltipTrigger>
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="text-xs">{getInitials(user.userName)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.userName} is online</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>

        {onlineUsers.length > 5 && (
          <div className="flex items-center justify-center h-8 w-8 bg-muted border-2 border-background rounded-full text-xs font-medium">
            +{onlineUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  )
}
