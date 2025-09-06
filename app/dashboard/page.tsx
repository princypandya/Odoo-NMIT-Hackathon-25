"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Navbar from "@/components/Navbar"
import ProgressChart from "@/components/ProgressChart"
import Analytics from "@/components/Analytics"
import NotificationCenter from "@/components/NotificationCenter"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Bell, TrendingUp, Plus } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [notifications, setNotifications] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)

  // Mock data for demonstration
  const mockProjects = [
    {
      projectId: "1",
      projectName: "Website Redesign",
      totalTasks: 24,
      completedTasks: 18,
      inProgressTasks: 4,
      todoTasks: 2,
      overdueTasks: 1,
      teamMembers: 5,
      dueDate: "2024-02-15",
      completionPercentage: 75,
    },
    {
      projectId: "2",
      projectName: "Mobile App Development",
      totalTasks: 32,
      completedTasks: 12,
      inProgressTasks: 8,
      todoTasks: 12,
      overdueTasks: 0,
      teamMembers: 7,
      dueDate: "2024-03-01",
      completionPercentage: 38,
    },
    {
      projectId: "3",
      projectName: "Marketing Campaign",
      totalTasks: 16,
      completedTasks: 14,
      inProgressTasks: 2,
      todoTasks: 0,
      overdueTasks: 0,
      teamMembers: 3,
      dueDate: "2024-01-30",
      completionPercentage: 88,
    },
  ]

  const mockAnalytics = {
    productivity: {
      tasksCompletedThisWeek: 23,
      tasksCompletedLastWeek: 18,
      averageCompletionTime: 4.2,
      onTimeDelivery: 87,
    },
    team: {
      activeMembers: 12,
      totalMembers: 15,
      topPerformers: [
        { name: "Sarah Johnson", tasksCompleted: 15, avatar: "" },
        { name: "Mike Chen", tasksCompleted: 12, avatar: "" },
        { name: "Emily Davis", tasksCompleted: 10, avatar: "" },
      ],
    },
    projects: {
      activeProjects: 3,
      completedProjects: 8,
      averageProjectDuration: 45,
      upcomingDeadlines: 2,
    },
  }

  const mockNotifications = [
    {
      id: "1",
      type: "task",
      title: "Task Completed",
      message: 'Sarah completed "Design homepage mockup" in Website Redesign',
      timestamp: new Date().toISOString(),
      read: false,
      priority: "medium",
    },
    {
      id: "2",
      type: "deadline",
      title: "Deadline Approaching",
      message: "Marketing Campaign is due in 2 days",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      priority: "high",
    },
    {
      id: "3",
      type: "team",
      title: "New Team Member",
      message: "Alex Rodriguez joined Mobile App Development team",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      priority: "low",
    },
  ]

  useEffect(() => {
    setProjects(mockProjects)
    setAnalyticsData(mockAnalytics)
    setNotifications(mockNotifications)
  }, [])

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.displayName || user.email}</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ProgressChart projects={projects} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {analyticsData && <Analytics data={analyticsData} />}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDeleteNotification={handleDeleteNotification}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
