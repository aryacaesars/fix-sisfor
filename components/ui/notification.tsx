import { toast } from "sonner"

type NotificationType = "success" | "error" | "warning" | "info"

interface NotificationProps {
  type: NotificationType
  message: string
  description?: string
  duration?: number
}

export const showNotification = ({
  type,
  message,
  description,
  duration = 3000
}: NotificationProps) => {
  switch (type) {
    case "success":
      toast.success(message, {
        description,
        duration,
      })
      break
    case "error":
      toast.error(message, {
        description,
        duration,
      })
      break
    case "warning":
      toast.warning(message, {
        description,
        duration,
      })
      break
    case "info":
      toast.info(message, {
        description,
        duration,
      })
      break
  }
}

// Helper functions for common notification types
export const showSuccessNotification = (message: string, description?: string) => {
  showNotification({ type: "success", message, description })
}

export const showErrorNotification = (message: string, description?: string) => {
  showNotification({ type: "error", message, description })
}

export const showWarningNotification = (message: string, description?: string) => {
  showNotification({ type: "warning", message, description })
}

export const showInfoNotification = (message: string, description?: string) => {
  showNotification({ type: "info", message, description })
} 