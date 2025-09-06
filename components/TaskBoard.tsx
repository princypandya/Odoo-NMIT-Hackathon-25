/*
 * Task Board Component
 * Kanban-style task board with drag and drop
 */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import TaskCard from "./TaskCard"
import CreateTaskModal from "./CreateTaskModal"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

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

interface TaskBoardProps {
  projectId: string
}

const statusColumns = [
  { id: "todo", title: "To Do", color: "bg-gray-100" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-100" },
  { id: "done", title: "Done", color: "bg-green-100" },
]

export default function TaskBoard({ projectId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/tasks`)
      setTasks(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks])
    setShowCreateTask(false)
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)))
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter((task) => task._id !== taskId))
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus })
      handleTaskUpdated(response.data)
      toast({
        title: "Task updated",
        description: `Task moved to ${newStatus.replace("-", " ")}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusColumns.map((column) => (
          <Card key={column.id}>
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Task Board</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setShowCreateTask(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id)
          return (
            <Card key={column.id} className="h-fit">
              <CardHeader className={`${column.color} rounded-t-lg`}>
                <CardTitle className="flex items-center justify-between">
                  <span>{column.title}</span>
                  <span className="text-sm font-normal bg-white px-2 py-1 rounded-full">{columnTasks.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onUpdate={handleTaskUpdated}
                      onDelete={handleTaskDeleted}
                      onStatusChange={updateTaskStatus}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <CreateTaskModal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onTaskCreated={handleTaskCreated}
        projectId={projectId}
        projectMembers={[]} // Will be passed from parent
      />
    </div>
  )
}
