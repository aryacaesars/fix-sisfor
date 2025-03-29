"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

export function useTemplates() {
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch templates
  const fetchTemplates = async (category, type) => {
    try {
      setIsLoading(true)

      let url = "/api/templates"
      const params = new URLSearchParams()

      if (category) {
        params.append("category", category)
      }

      if (type) {
        params.append("type", type)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch templates")
      }

      const data = await response.json()
      setTemplates(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching templates:", error)
      setError("Failed to load templates")
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to load templates. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Create a new template
  const createTemplate = async (templateData) => {
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      })

      if (!response.ok) {
        throw new Error("Failed to create template")
      }

      const newTemplate = await response.json()
      setTemplates([...templates, newTemplate])

      toast({
        title: "Success",
        description: "Template created successfully",
      })

      return newTemplate
    } catch (error) {
      console.error("Error creating template:", error)
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Update a template
  const updateTemplate = async (templateId, data) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update template")
      }

      const updatedTemplate = await response.json()

      setTemplates(templates.map((template) => (template.id === templateId ? updatedTemplate : template)))

      toast({
        title: "Success",
        description: "Template updated successfully",
      })

      return updatedTemplate
    } catch (error) {
      console.error("Error updating template:", error)
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Delete a template
  const deleteTemplate = async (templateId) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete template")
      }

      setTemplates(templates.filter((template) => template.id !== templateId))

      toast({
        title: "Success",
        description: "Template deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  // Load templates on component mount
  useEffect(() => {
    if (user) {
      fetchTemplates()
    }
  }, [user])

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
}

