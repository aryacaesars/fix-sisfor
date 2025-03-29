import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create a test student user
  const studentPassword = await bcrypt.hash("password123", 10)
  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      name: "Test Student",
      hashedPassword: studentPassword,
      role: "student",
    },
  })

  // Create a test freelancer user
  const freelancerPassword = await bcrypt.hash("password123", 10)
  const freelancer = await prisma.user.upsert({
    where: { email: "freelancer@example.com" },
    update: {},
    create: {
      email: "freelancer@example.com",
      name: "Test Freelancer",
      hashedPassword: freelancerPassword,
      role: "freelancer",
    },
  })

  console.log({ student, freelancer })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

