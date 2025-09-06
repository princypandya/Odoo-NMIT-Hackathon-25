/*
 * Create Project Modal Component
 * Modal form for creating new projects
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
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import api from "@/lib/api"

interface Project {
  _id: string
  name: string
  description: string
  members: string[]
  createdAt: string
  taskStats: {
    total: number
    completed: number
    inProgress: number
  }
}

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onProjectCreated: (project: Project) => void
}

export default function CreateProjectModal({ open, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)

    try {
      const response = await api.post("/projects", {
        name: name.trim(),
        description: description.trim(),
        createdBy: user?.uid,
      })

      onProjectCreated(response.data)
      toast({
        title: "Project created!",
        description: `${name} has been created successfully.`,
      })

      // Reset form
      setName("")
      setDescription("")
    } catch (error: any) {
      toast({
        title: "Failed to create project",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setName("")
      setDescription("")
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Start a new project and invite your team members to collaborate.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project (optional)"
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
