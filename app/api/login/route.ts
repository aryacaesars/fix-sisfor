import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 400 })
    }

    // Cek password
    const valid = await bcrypt.compare(password, user.hashedPassword)
    if (!valid) {
      return NextResponse.json({ error: "Password salah" }, { status: 400 })
    }

    // Cek emailVerified
    if (!user.emailVerified) {
      return NextResponse.json({ error: "Email belum diverifikasi. Silakan cek email Anda untuk verifikasi." }, { status: 403 })
    }

    // Jangan kirim hashedPassword ke client
    const { hashedPassword, ...userWithoutPassword } = user

    // (Tambahkan session/token di sini jika perlu)
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan saat login" }, { status: 500 })
  }
}