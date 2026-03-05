import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ error: "Token dan password diperlukan" }, { status: 400 })
    }

    const resetToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!resetToken || resetToken.type !== "password-reset") {
      return NextResponse.json(
        { error: "Token tidak valid atau sudah digunakan" },
        { status: 400 },
      )
    }

    if (new Date() > resetToken.expires) {
      await prisma.verificationToken
        .delete({
          where: { token },
        })
        .catch(() => {})

      return NextResponse.json(
        { error: "Token sudah kadaluarsa. Silakan minta link reset baru." },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: resetToken.identifier },
    })

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { email: resetToken.identifier },
      data: {
        hashedPassword,
      },
    })

    await prisma.verificationToken
      .delete({
        where: { token },
      })
      .catch(() => {})

    return NextResponse.json({
      message: "Password berhasil direset. Silakan login dengan password baru Anda.",
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mereset password" },
      { status: 500 },
    )
  }
}

