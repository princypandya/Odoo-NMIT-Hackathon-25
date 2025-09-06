/*
 * Settings Page
 * Application-wide settings and preferences
 */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Settings, Palette, Shield, Database } from "lucide-react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"

export default function SettingsPage() {
  const router = useRouter()
  const [theme, setTheme] = useState("system")
  const [autoSave, setAutoSave] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [showCompletedTasks, setShowCompletedTasks] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your application preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how SynergySphere looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Use a more compact layout to fit more content</p>
                </div>
                <Switch id="compact-mode" checked={compactMode} onCheckedChange={setCompactMode} />
              </div>
            </CardContent>
          </Card>

          {/* Behavior */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Behavior
              </CardTitle>
              <CardDescription>Configure how the application behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Auto-save</Label>
                  <p className="text-sm text-muted-foreground">Automatically save changes as you work</p>
                </div>
                <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-completed">Show Completed Tasks</Label>
                  <p className="text-sm text-muted-foreground">Display completed tasks in task boards</p>
                </div>
                <Switch id="show-completed" checked={showCompletedTasks} onCheckedChange={setShowCompletedTasks} />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Manage your privacy and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Data Export</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Download a copy of all your data from SynergySphere
                </p>
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Account Deletion</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data & Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data & Storage
              </CardTitle>
              <CardDescription>Manage your data and storage preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Storage Used</p>
                  <p className="text-sm text-muted-foreground">2.4 MB of 1 GB used</p>
                </div>
                <div className="w-32 bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "2.4%" }}></div>
                </div>
              </div>

              <Separator />

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Clear Cache</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Clear cached data to free up space and resolve issues
                </p>
                <Button variant="outline" size="sm">
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
