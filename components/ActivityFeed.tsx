/*
 * Activity Feed Component
 * Shows recent project activities and updates
 */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, MessageSquare, UserPlus, Calendar, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  _id: string
  type: "task_created" | "task_completed" | "message_sent" | "member_added" | "project_updated"
  userId: string
  userName: string
  projectId: string
  description: string
  metadata?: {
    taskTitle?: string
    memberName?: string
    messagePreview?: string
  }
  createdAt: string
}

interface ActivityFeedProps {
  projectId: string
  limit?: number
}

export default function ActivityFeed({ projectId, limit = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock activities for now - in a real app, this would fetch from API
    const mockActivities: Activity[] = [
      {
        _id: "1",
        type: "task_completed",
        userId: "user1",
        userName: "John Doe",
        projectId,
        description: "completed task",
        metadata: { taskTitle: "Update homepage design" },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        _id: "2",
        type: "message_sent",
        userId: "user2",
        userName: "Jane Smith",
        projectId,
        description: "sent a message",
        metadata: { messagePreview: "Great work on the latest updates!" },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        _id: "3",
        type: "task_created",
        userId: "user1",
        userName: "John Doe",
        projectId,
        description: "created a new task",
        metadata: { taskTitle: "Implement user authentication" },
        createdAt: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        _id: "4",
        type: "member_added",
        userId: "user3",
        userName: "Mike Johnson",
        projectId,
        description: "joined the project",
        metadata: { memberName: "Mike Johnson" },
        createdAt: new Date(Date.now() - 14400000).toISOString(),
      },
    ]

    setTimeout(() => {
      setActivities(mockActivities.slice(0, limit))
      setLoading(false)
    }, 1000)
  }, [projectId, limit])

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "task_created":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "message_sent":
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      case "member_added":
        return <UserPlus className="h-4 w-4 text-orange-600" />
      case "project_updated":
        return <Calendar className="h-4 w-4 text-gray-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "task_completed":
        return "bg-green-100 text-green-800"
      case "task_created":
        return "bg-blue-100 text-blue-800"
      case "message_sent":
        return "bg-purple-100 text-purple-800"
      case "member_added":
        return "bg-orange-100 text-orange-800"
      case "project_updated":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity._id}>
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{getInitials(activity.userName)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <span className="font-medium text-sm">{activity.userName}</span>
                      <span className="text-sm text-muted-foreground">{activity.description}</span>
                    </div>

                    {/* Activity metadata */}
                    {activity.metadata && (
                      <div className="mt-1">
                        {activity.metadata.taskTitle && (
                          <Badge variant="outline" className="text-xs">
                            {activity.metadata.taskTitle}
                          </Badge>
                        )}
                        {activity.metadata.messagePreview && (
                          <p className="text-sm text-muted-foreground italic">"{activity.metadata.messagePreview}"</p>
                        )}
                        {activity.metadata.memberName && (
                          <Badge variant="outline" className="text-xs">
                            {activity.metadata.memberName}
                          </Badge>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  <Badge variant="outline" className={`text-xs ${getActivityColor(activity.type)}`}>
                    {activity.type.replace("_", " ")}
                  </Badge>
                </div>

                {index < activities.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
