/*
 * Project List Component
 * Displays user's projects in a grid layout
 */
"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, CheckCircle, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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

interface ProjectListProps {
  projects: Project[]
  loading: boolean
}

export default function ProjectList({ projects, loading }: ProjectListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to get started with team collaboration.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link key={project._id} href={`/projects/${project._id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Project Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{project.members.length} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Task Progress */}
                  {project.taskStats && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>
                          {project.taskStats.completed}/{project.taskStats.total} tasks
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              project.taskStats.total > 0
                                ? (project.taskStats.completed / project.taskStats.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {project.taskStats.completed} done
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {project.taskStats.inProgress} in progress
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
