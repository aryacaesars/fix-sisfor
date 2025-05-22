import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return "No date";
  try {
    // Always parse as UTC and display as Asia/Jakarta
    let date: Date;
    if (dateString.endsWith('Z')) {
      date = new Date(dateString);
    } else {
      date = new Date(dateString + 'Z');
    }
    return date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    return "Invalid date";
  }
};

export function formatDateWithTime(date: Date | string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

export const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "Rp 0"
  }
  
  try {
    return new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  } catch (error) {
    return "Rp 0"
  }
};

export const getStatusColor = (status: string | undefined | null) => {
  switch (status) {
    case "active":
      return "bg-yellow-500"
    case "completed":
      return "bg-green-500"
    case "on-hold":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
};

