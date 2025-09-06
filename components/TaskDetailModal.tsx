/*
 * Task Detail Modal Component
 * Detailed view and editing of tasks
 */
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, User, Tag, Save, Loader2 } from "lucide-react"
import { format } from "date-fns"
import api from "@/lib/api"

interface Task {
  _id: string
  title: string
  description: string
  assignedTo: string | null
  assignedBy: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high" | "urgent"
  dueDate: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface TaskDetailModalProps {
  open: boolean
  onClose: () => void
  task: Task
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
}

export default function TaskDetailModal({ open, onClose, task, onUpdate, onDelete }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [status, setStatus] = useState(task.status)
  const [priority, setPriority] = useState(task.priority)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description)
    setStatus(task.status)
    setPriority(task.priority)
  }, [task])

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await api.put(`/tasks/${task._id}`, {
        title,
        description,
        status,
        priority,
      })

      onUpdate(response.data)
      setIsEditing(false)
      toast({
        title: "Task updated",
        description: "Task has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to update task",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600"
      case "high":
        return "text-orange-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "text-green-600"
      case "in-progress":
        return "text-blue-600"
      case "todo":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const getInitials = (userId: string) => {
    return userId.slice(0, 2).toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Task Details</DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            {isEditing ? (
              <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} />
            ) : (
              <h2 className="text-2xl font-semibold">{task.title}</h2>
            )}
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            {isEditing ? (
              <Textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={loading}
              />
            ) : (
              <p className="text-muted-foreground">{task.description || "No description provided"}</p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              {isEditing ? (
                <Select value={status} onValueChange={setStatus} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className={`capitalize ${getStatusColor(task.status)}`}>
                  {task.status.replace("-", " ")}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              {isEditing ? (
                <Select value={priority} onValueChange={setPriority} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className={`capitalize ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Task Metadata */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Assignee */}
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Assigned to</p>
                  {task.assignedTo ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{getInitials(task.assignedTo)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignedTo}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Unassigned</p>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-muted-foreground">
                    {task.dueDate ? format(new Date(task.dueDate), "PPP") : "No due date"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Created */}
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(task.createdAt), "PPP")}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Tags</p>
                  {task.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
