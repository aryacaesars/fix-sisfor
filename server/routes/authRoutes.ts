const express = require("express")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const router = express.Router()

router.post("/send-verification-email", async (req, res) => {
  const { email } = req.body

  try {
    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000) // Token berlaku selama 1 jam

    // Simpan token ke database
    await prisma.verificationToken.upsert({
      where: { identifier: email },
      update: { token, expires },
      create: { identifier: email, token, expires },
    })

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

    // Konfigurasi transporter Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Kirim email verifikasi
    await transporter.sendMail({
      from: `"Ciao Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email",
      html: `
        <p>Hi ${user.name || "User"},</p>
        <p>Thank you for registering. Please click the link below to verify your email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    })

    res.status(200).json({ message: "Verification email sent" })
  } catch (error) {
    console.error("Error sending verification email:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router