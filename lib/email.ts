import nodemailer from "nodemailer";

// Konfigurasi transporter email
const transporter = nodemailer.createTransport({
  service: "Gmail", // Bisa diganti dengan layanan email lain
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`

  await transporter.sendMail({
    from: `"Ciao Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
        <p>Thank you for registering in Ciao. To complete the registration, please verify your email by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verifikasi Email</a>
        </div>
        <p>Or, you can copy and paste the following URL into your browser:</p>
        <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not register in Ciao, please ignore this email.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Ciao. All rights reserved.</p>
        </div>
      </div>
    `,
  })
}

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  await transporter.sendMail({
    from: `"Ciao Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

