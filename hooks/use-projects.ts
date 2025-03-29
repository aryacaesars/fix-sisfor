"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/projects")

      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }

      const data = await response.json()
      setProjects(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching projects:", error)
      setError("Failed to load projects")
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Create a new project
  const createProject = async (projectData) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        throw new Error("Failed to create project")
      }

      const newProject = await response.json()
      setProjects([...projects, newProject])

      toast({
        title: "Success",
        description: "Project created successfully",
      })

      return newProject
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Update a project
  const updateProject = async (projectId, data) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update project")
      }

      const updatedProject = await response.json()

      setProjects(projects.map((project) => (project.id === projectId ? updatedProject : project)))

      toast({
        title: "Success",
        description: "Project updated successfully",
      })

      return updatedProject
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Delete a project
  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      setProjects(projects.filter((project) => project.id !== projectId))

      toast({
        title: "Success",
        description: "Project deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  // Load projects on component mount
  useEffect(() => {
    if (user && user.role === "freelancer") {
      fetchProjects()
    }
  }, [user])

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}

