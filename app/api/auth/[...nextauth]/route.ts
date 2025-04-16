import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { compare } from "bcryptjs" // Changed from bcrypt to bcryptjs

const handler = NextAuth({
  ...authOptions,
  providers: [
    ...authOptions.providers || [],
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        
        // Add this critical check
        if (!user?.emailVerified) {
          console.log("Login attempt with unverified email:", credentials.email)
          return null // Block login if email isn't verified
        }
        
        const passwordValid = await compare(credentials.password, user.password || "")
        
        if (passwordValid) {
          return user
        }
        
        return null
      }
    }
  ]
})

export { handler as GET, handler as POST }

