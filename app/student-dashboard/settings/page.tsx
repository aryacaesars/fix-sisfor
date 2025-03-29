"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedSection } from "@/components/animated-section"
import { Home, BookOpen, LayoutGrid, FileText, Settings, User, Save } from "lucide-react"
import { useRBAC } from "@/hooks/use-rbac"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

const studentNavItems = [
  {
    title: "Home",
    href: "/student-dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Kanban Board",
    href: "/student-dashboard/kanban",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    title: "Assignments",
    href: "/student-dashboard/assignments",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Form Templates",
    href: "/student-dashboard/templates",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/student-dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Account",
    href: "/student-dashboard/account",
    icon: <User className="h-5 w-5" />,
  },
]

export default function StudentSettingsPage() {
  const { isAuthorized, isLoading } = useRBAC(["student"])
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      mobile: false,
    },
    appearance: {
      theme: theme || "system",
      fontSize: "medium",
      colorScheme: "default",
    },
    privacy: {
      profileVisibility: "public",
      activityStatus: true,
      shareData: false,
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // The useRBAC hook will handle redirection
  }

  const handleSwitchChange = (category: string, setting: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: checked,
      },
    }))
  }

  const handleSelectChange = (category: string, setting: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }))

    // Apply theme change immediately
    if (category === "appearance" && setting === "theme") {
      setTheme(value)
    }
  }

  const handleRadioChange = (category: string, setting: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save settings to localStorage
      localStorage.setItem("user-settings", JSON.stringify(settings))

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout navItems={studentNavItems} role="student">
      <AnimatedSection>
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleSwitchChange("notifications", "email", checked)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="browser-notifications">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                </div>
                <Switch
                  id="browser-notifications"
                  checked={settings.notifications.browser}
                  onCheckedChange={(checked) => handleSwitchChange("notifications", "browser", checked)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mobile-notifications">Mobile Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications on your mobile device</p>
                </div>
                <Switch
                  id="mobile-notifications"
                  checked={settings.notifications.mobile}
                  onCheckedChange={(checked) => handleSwitchChange("notifications", "mobile", checked)}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how Ciao looks for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => handleSelectChange("appearance", "theme", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <Select
                  value={settings.appearance.fontSize}
                  onValueChange={(value) => handleSelectChange("appearance", "fontSize", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color-scheme">Color Scheme</Label>
                <Select
                  value={settings.appearance.colorScheme}
                  onValueChange={(value) => handleSelectChange("appearance", "colorScheme", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="color-scheme">
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>Manage your privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <RadioGroup
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value) => handleRadioChange("privacy", "profileVisibility", value)}
                  disabled={isSaving}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public">Public</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friends" id="friends" />
                    <Label htmlFor="friends">Friends Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private">Private</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="activity-status">Activity Status</Label>
                  <p className="text-sm text-muted-foreground">Show when you're active</p>
                </div>
                <Switch
                  id="activity-status"
                  checked={settings.privacy.activityStatus}
                  onCheckedChange={(checked) => handleSwitchChange("privacy", "activityStatus", checked)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="share-data">Share Usage Data</Label>
                  <p className="text-sm text-muted-foreground">Help improve Ciao by sharing anonymous usage data</p>
                </div>
                <Switch
                  id="share-data"
                  checked={settings.privacy.shareData}
                  onCheckedChange={(checked) => handleSwitchChange("privacy", "shareData", checked)}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>Customize accessibility settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast">High Contrast</Label>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.accessibility.highContrast}
                  onCheckedChange={(checked) => handleSwitchChange("accessibility", "highContrast", checked)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={settings.accessibility.reducedMotion}
                  onCheckedChange={(checked) => handleSwitchChange("accessibility", "reducedMotion", checked)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="screen-reader">Screen Reader Optimization</Label>
                  <p className="text-sm text-muted-foreground">Optimize for screen readers</p>
                </div>
                <Switch
                  id="screen-reader"
                  checked={settings.accessibility.screenReader}
                  onCheckedChange={(checked) => handleSwitchChange("accessibility", "screenReader", checked)}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </AnimatedSection>
    </DashboardLayout>
  )
}

