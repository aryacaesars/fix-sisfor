import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 400 })
    }

    // Cari token di database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 400 })
    }

    // Cek apakah token sudah kadaluarsa
    if (new Date() > verificationToken.expires) {
      return NextResponse.json({ error: "Token sudah kadaluarsa" }, { status: 400 })
    }

    // Update user sebagai terverifikasi
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    // Hapus token yang sudah digunakan
    await prisma.verificationToken.delete({
      where: { token },
    })

    // Redirect ke halaman login dengan pesan sukses
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?verified=true`)
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat verifikasi email" }, { status: 500 })
  }
}

