"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

export function useAssignments() {
  const [assignments, setAssignments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/assignments")

      if (!response.ok) {
        throw new Error("Failed to fetch assignments")
      }

      const data = await response.json()
      setAssignments(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching assignments:", error)
      setError("Failed to load assignments")
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to load assignments. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Create a new assignment
  const createAssignment = async (assignmentData) => {
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      })

      if (!response.ok) {
        throw new Error("Failed to create assignment")
      }

      const newAssignment = await response.json()
      setAssignments([...assignments, newAssignment])

      toast({
        title: "Success",
        description: "Assignment created successfully",
      })

      return newAssignment
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Update an assignment
  const updateAssignment = async (assignmentId, data) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update assignment")
      }

      const updatedAssignment = await response.json()

      setAssignments(assignments.map((assignment) => (assignment.id === assignmentId ? updatedAssignment : assignment)))

      toast({
        title: "Success",
        description: "Assignment updated successfully",
      })

      return updatedAssignment
    } catch (error) {
      console.error("Error updating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Delete an assignment
  const deleteAssignment = async (assignmentId) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete assignment")
      }

      setAssignments(assignments.filter((assignment) => assignment.id !== assignmentId))

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting assignment:", error)
      toast({
        title: "Error",
        description: "Failed to delete assignment. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  // Load assignments on component mount
  useEffect(() => {
    if (user && user.role === "student") {
      fetchAssignments()
    }
  }, [user])

  return {
    assignments,
    isLoading,
    error,
    fetchAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  }
}

