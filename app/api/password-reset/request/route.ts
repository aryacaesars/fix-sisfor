import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email diperlukan" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Untuk keamanan, jangan bocorkan apakah email terdaftar
      return NextResponse.json({
        message: "Jika email terdaftar, link reset password telah dikirim.",
      })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 jam

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
        type: "password-reset",
      },
    })

    await sendPasswordResetEmail(email, token)

    return NextResponse.json({
      message: "Jika email terdaftar, link reset password telah dikirim.",
    })
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim email reset password" },
      { status: 500 },
    )
  }
}

