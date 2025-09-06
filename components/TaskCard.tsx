/*
 * Task Card Component
 * Individual task card for the Kanban board
 */
"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, MoreHorizontal, Trash2, Edit, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import TaskDetailModal from "./TaskDetailModal"

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

interface TaskCardProps {
  task: Task
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: string) => void
}

export default function TaskCard({ task, onUpdate, onDelete, onStatusChange }: TaskCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusActions = () => {
    const actions = []
    if (task.status !== "in-progress") {
      actions.push({
        label: "Move to In Progress",
        action: () => onStatusChange(task._id, "in-progress"),
      })
    }
    if (task.status !== "done") {
      actions.push({
        label: "Mark as Done",
        action: () => onStatusChange(task._id, "done"),
      })
    }
    if (task.status !== "todo") {
      actions.push({
        label: "Move to To Do",
        action: () => onStatusChange(task._id, "todo"),
      })
    }
    return actions
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"

  const getInitials = (userId: string) => {
    return userId.slice(0, 2).toUpperCase()
  }

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => setShowDetails(true)}>
        <CardContent className="p-4">
          {/* Priority indicator */}
          <div className="flex items-start justify-between mb-3">
            <div className={`w-1 h-6 rounded-full ${getPriorityColor(task.priority)}`} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetails(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {getStatusActions().map((action, index) => (
                  <DropdownMenuItem key={index} onClick={action.action}>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    {action.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteConfirm(true)
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Task title */}
          <h3 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h3>

          {/* Task description */}
          {task.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Due date */}
            <div className="flex items-center gap-2">
              {task.dueDate && (
                <div
                  className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(task.dueDate), "MMM d")}</span>
                </div>
              )}
              <Badge variant={getPriorityVariant(task.priority)} className="text-xs capitalize">
                {task.priority}
              </Badge>
            </div>

            {/* Assignee */}
            {task.assignedTo && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{getInitials(task.assignedTo)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      <TaskDetailModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        task={task}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(task._id)
                setShowDeleteConfirm(false)
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
