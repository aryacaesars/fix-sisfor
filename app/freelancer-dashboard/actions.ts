"use server"

import { cookies } from "next/headers"

export async function saveUserRole(role: string) {
  // In a real application, you would save this to a database
  // For now, we'll just store it in a cookie

  // Validate the role
  if (role !== "student" && role !== "freelancer") {
    throw new Error("Invalid role")
  }

  // Set a cookie with the user's role
  cookies().set("user-role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })

  // Simulate a delay for the API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    success: true,
    role: role,
    message: `Role set to ${role} successfully`,
  }
}

