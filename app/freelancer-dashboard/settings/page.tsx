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
import { Home, Briefcase, LayoutGrid, FileText, Settings, User, Save } from "lucide-react"
import { useRBAC } from "@/hooks/use-rbac"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

const freelancerNavItems = [
  {
    title: "Home",
    href: "/freelancer-dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Kanban Board",
    href: "/freelancer-dashboard/kanban",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    title: "Projects",
    href: "/freelancer-dashboard/projects",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "Form Templates",
    href: "/freelancer-dashboard/templates",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/freelancer-dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Account",
    href: "/freelancer-dashboard/account",
    icon: <User className="h-5 w-5" />,
  },
]

export default function FreelancerSettingsPage() {
  const { isAuthorized, isLoading } = useRBAC(["freelancer"])
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      clientMessages: true,
      projectUpdates: true,
      paymentAlerts: true,
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
    business: {
      invoiceTemplate: "standard",
      autoSendInvoices: false,
      paymentReminders: true,
      currencyDisplay: "USD",
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
    <DashboardLayout navItems={freelancerNavItems} role="freelancer">
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
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="client-messages">Client Messages</Label>
                  <p className="text-sm text-muted-foreground">Get notified when clients send messages</p>
                </div>
                <Switch
                  id="client-messages"
                  checked={settings.notifications.clientMessages}
                  onCheckedChange={(checked) => handleSwitchChange("notifications", "clientMessages", checked)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="project-updates">Project Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about project status changes</p>
                </div>
                <Switch
                  id="project-updates"
                  checked={settings.notifications.projectUpdates}
                  onCheckedChange={(checked) => handleSwitchChange("notifications", "projectUpdates", checked)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-alerts">Payment Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about payments and invoices</p>
                </div>
                <Switch
                  id="payment-alerts"
                  checked={settings.notifications.paymentAlerts}
                  onCheckedChange={(checked) => handleSwitchChange("notifications", "paymentAlerts", checked)}
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
              <CardTitle>Business Settings</CardTitle>
              <CardDescription>Configure your business preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-template">Invoice Template</Label>
                <Select
                  value={settings.business.invoiceTemplate}
                  onValueChange={(value) => handleSelectChange("business", "invoiceTemplate", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="invoice-template">
                    <SelectValue placeholder="Select invoice template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency-display">Currency Display</Label>
                <Select
                  value={settings.business.currencyDisplay}
                  onValueChange={(value) => handleSelectChange("business", "currencyDisplay", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="currency-display">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-send-invoices">Auto-Send Invoices</Label>
                  <p className="text-sm text-muted-foreground">Automatically send invoices on due dates</p>
                </div>
                <Switch
                  id="auto-send-invoices"
                  checked={settings.business.autoSendInvoices}
                  onCheckedChange={(checked) => handleSwitchChange("business", "autoSendInvoices", checked)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-reminders">Payment Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send automatic reminders for overdue payments</p>
                </div>
                <Switch
                  id="payment-reminders"
                  checked={settings.business.paymentReminders}
                  onCheckedChange={(checked) => handleSwitchChange("business", "paymentReminders", checked)}
                  disabled={isSaving}
                />
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
                    <RadioGroupItem value="clients" id="clients" />
                    <Label htmlFor="clients">Clients Only</Label>
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

