/*
 * Create Task Modal Component
 * Modal form for creating new tasks
 */
"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Loader2, X } from "lucide-react"
import { format } from "date-fns"
import api from "@/lib/api"
import { useToast } from "@/components/ui/use-toast" // Import useToast

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

interface Member {
  userId: string
  role: string
  joinedAt: string
}

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  onTaskCreated: (task: Task) => void
  projectId: string
  projectMembers: Member[]
}

export default function CreateTaskModal({
  open,
  onClose,
  onTaskCreated,
  projectId,
  projectMembers,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast() // Declare useToast

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)

    try {
      const response = await api.post(`/projects/${projectId}/tasks`, {
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignedTo || null,
        priority,
        dueDate: dueDate?.toISOString() || null,
        tags,
      })

      onTaskCreated(response.data)
      toast({
        title: "Task created!",
        description: `${title} has been created successfully.`,
      })

      // Reset form
      setTitle("")
      setDescription("")
      setAssignedTo("")
      setPriority("medium")
      setDueDate(undefined)
      setTags([])
      setTagInput("")
    } catch (error: any) {
      toast({
        title: "Failed to create task",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setTitle("")
      setDescription("")
      setAssignedTo("")
      setPriority("medium")
      setDueDate(undefined)
      setTags([])
      setTagInput("")
      onClose()
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to your project and assign it to team members.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title *</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
              disabled={loading}
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task (optional)"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Assignee and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assign to</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {projectMembers.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.userId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
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
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-transparent"
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                placeholder="Add tags"
                disabled={loading}
              />
              <Button type="button" onClick={addTag} disabled={loading || !tagInput.trim()}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
