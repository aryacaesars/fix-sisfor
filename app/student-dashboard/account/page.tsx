"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AnimatedSection } from "@/components/animated-section"
import { Home, BookOpen, LayoutGrid, FileText, Settings, User, Save } from "lucide-react"
import { useRBAC } from "@/hooks/use-rbac"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Modal } from "@/components/ui/modal"



export default function StudentAccountPage() {
  const { isAuthorized, isLoading } = useRBAC(["student"])
  const { user } = useAuth()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmationInput, setConfirmationInput] = useState("")
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // The useRBAC hook will handle redirection
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
  
    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          name: formData.name,
        }),
      })
  
      if (!response.ok) {
        throw new Error("Failed to update profile")
      }
  
      const updatedUser = await response.json()
  
      // Update local state with the updated user data
      setFormData({
        ...formData,
        name: updatedUser.name,
      })
  
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirmationInput !== `${user?.name}-${user?.role}`) {
      toast({
        title: "Invalid confirmation",
        description: `Please type "${user?.name}-${user?.role}" to confirm.`,
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete account")
      }

      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      })

      // Redirect to home or login page after account deletion
      window.location.href = "/login"
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting your account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setIsModalOpen(false)
      setConfirmationInput("")
    }
  }

  return (
      <AnimatedSection>
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details and personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={isUpdating} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={true}
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>User Role</Label>
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted">
                    <span className="capitalize">{user?.role}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your role was selected during sign-up and cannot be changed. If you need to use a different role,
                    please create a new account.
                  </p>
                </div>
                <Button type="submit" className="mt-4" disabled={isUpdating}>
                  {isUpdating ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" disabled={isUpdating} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" disabled={isUpdating} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" disabled={isUpdating} />
                </div>
              </div>
              <Button variant="outline" className="mt-2" disabled={isUpdating}>
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button
                variant="destructive"
                onClick={() => setIsModalOpen(true)}
                disabled={isUpdating}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>

          {/* Modal for delete confirmation */}
          {isModalOpen && (
            <Modal
              title="Confirm Account Deletion"
              onClose={() => setIsModalOpen(false)}
            >
              <p className="mb-4 text-sm text-muted-foreground">
                To confirm, please type <strong>{`${user?.name}-${user?.role}`}</strong> below.
              </p>
              <Input
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder="Type your account name-role"
                disabled={isUpdating}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isUpdating || confirmationInput !== `${user?.name}-${user?.role}`}
                >
                  {isUpdating ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </Modal>
          )}
        </div>
      </AnimatedSection>
  )
}

