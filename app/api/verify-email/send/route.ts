import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email diperlukan" }, { status: 400 })
    }

    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    // Cek apakah email sudah diverifikasi
    if (user.emailVerified) {
      return NextResponse.json({ error: "Email sudah diverifikasi" }, { status: 400 })
    }

    // Generate token baru
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 jam

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    // Create a new token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Kirim email verifikasi
    await sendVerificationEmail(email, token)

    return NextResponse.json({ message: "Email verifikasi telah dikirim" })
  } catch (error) {
    console.error("Error sending verification email:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengirim email verifikasi" }, { status: 500 })
  }
}

