"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Clock, Users, Target, BarChart3, Download } from "lucide-react"

interface AnalyticsData {
  productivity: {
    tasksCompletedThisWeek: number
    tasksCompletedLastWeek: number
    averageCompletionTime: number
    onTimeDelivery: number
  }
  team: {
    activeMembers: number
    totalMembers: number
    topPerformers: Array<{
      name: string
      tasksCompleted: number
      avatar: string
    }>
  }
  projects: {
    activeProjects: number
    completedProjects: number
    averageProjectDuration: number
    upcomingDeadlines: number
  }
}

interface AnalyticsProps {
  data: AnalyticsData
}

export default function Analytics({ data }: AnalyticsProps) {
  const productivityTrend = data.productivity.tasksCompletedThisWeek - data.productivity.tasksCompletedLastWeek
  const isProductivityUp = productivityTrend > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Productivity</CardTitle>
            {isProductivityUp ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.productivity.tasksCompletedThisWeek}</div>
            <p className={`text-xs ${isProductivityUp ? "text-green-600" : "text-red-600"}`}>
              {isProductivityUp ? "+" : ""}
              {productivityTrend} from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.productivity.averageCompletionTime}h</div>
            <p className="text-xs text-muted-foreground">Per task</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.productivity.onTimeDelivery}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.team.activeMembers}</div>
            <p className="text-xs text-muted-foreground">of {data.team.totalMembers} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Project Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Projects</span>
              <Badge variant="secondary">{data.projects.activeProjects}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completed Projects</span>
              <Badge variant="secondary">{data.projects.completedProjects}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg. Project Duration</span>
              <Badge variant="outline">{data.projects.averageProjectDuration} days</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Upcoming Deadlines</span>
              <Badge variant={data.projects.upcomingDeadlines > 5 ? "destructive" : "secondary"}>
                {data.projects.upcomingDeadlines}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.team.topPerformers.map((performer, index) => (
                <div key={performer.name} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{performer.name}</p>
                    <p className="text-sm text-muted-foreground">{performer.tasksCompleted} tasks completed</p>
                  </div>
                  <Badge variant="secondary">{performer.tasksCompleted}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center space-y-2">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">Activity chart would be rendered here</p>
              <p className="text-sm text-muted-foreground">Integration with charting library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
