import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ 
        error: "Token tidak valid",
        message: "Token tidak ditemukan dalam request"
      }, { status: 400 })
    }

    // Cari token di database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      console.error("Token not found in database:", token)
      return NextResponse.json({ 
        error: "Token tidak valid",
        message: "Token tidak ditemukan atau sudah digunakan"
      }, { status: 400 })
    }

    // Cek apakah token sudah kadaluarsa
    if (new Date() > verificationToken.expires) {
      // Hapus token yang sudah kadaluarsa
      await prisma.verificationToken.delete({
        where: { token },
      }).catch(() => {
        // Ignore error if token already deleted
      })
      
      return NextResponse.json({ 
        error: "Token sudah kadaluarsa",
        message: "Token verifikasi sudah kadaluarsa. Silakan minta token baru."
      }, { status: 400 })
    }

    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      console.error("User not found for email:", verificationToken.identifier)
      return NextResponse.json({ 
        error: "User tidak ditemukan",
        message: "User dengan email tersebut tidak ditemukan"
      }, { status: 404 })
    }

    // Update user sebagai terverifikasi
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    // Hapus token yang sudah digunakan
    await prisma.verificationToken.delete({
      where: { token },
    }).catch(() => {
      // Ignore error if token already deleted
    })

    // Return JSON response instead of redirect for better client-side handling
    return NextResponse.json({ 
      success: true,
      message: "Email berhasil diverifikasi",
      redirectUrl: "/auth/login?verified=true"
    }, { status: 200 })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json({ 
      error: "Terjadi kesalahan saat verifikasi email",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

