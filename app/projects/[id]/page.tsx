/*
 * Project Detail Page
 * Shows project overview, tasks, and team members
 */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Settings, Users, Plus } from "lucide-react"
import Navbar from "@/components/Navbar"
import TaskBoard from "@/components/TaskBoard"
import ProjectMembers from "@/components/ProjectMembers"
import ChatBox from "@/components/ChatBox"
import ProgressChart from "@/components/ProgressChart"
import CreateTaskModal from "@/components/CreateTaskModal"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import ActivityFeed from "@/components/ActivityFeed"

interface Project {
  _id: string
  name: string
  description: string
  createdBy: string
  members: Array<{
    userId: string
    role: string
    joinedAt: string
  }>
  status: string
  createdAt: string
  taskStats: {
    total: number
    completed: number
    inProgress: number
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateTask, setShowCreateTask] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${params.id}`)
      setProject(response.data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = () => {
    setShowCreateTask(false)
    fetchProject() // Refresh project data
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project not found</h1>
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isOwnerOrAdmin = project.members.some(
    (member) => member.userId === user?.uid && ["owner", "admin"].includes(member.role),
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground mt-1">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreateTask(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
            {isOwnerOrAdmin && (
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.taskStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.taskStats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.taskStats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.members.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <TaskBoard projectId={project._id} />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressChart taskStats={project.taskStats} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{project.description || "No description provided"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    <span className="capitalize px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                      {project.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Created</h4>
                    <p className="text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                <ActivityFeed projectId={project._id} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <ProjectMembers projectId={project._id} members={project.members} isOwnerOrAdmin={isOwnerOrAdmin} />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <ChatBox projectId={project._id} />
          </TabsContent>
        </Tabs>
      </main>

      <CreateTaskModal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onTaskCreated={handleTaskCreated}
        projectId={project._id}
        projectMembers={project.members}
      />
    </div>
  )
}
