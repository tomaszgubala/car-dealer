import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const u = await prisma.user.findUnique({ where: { email: 'admin@dealer.pl' } })
  console.log('hash:', u?.password)
  const valid = await bcrypt.compare('Admin1234!', u?.password || '')
  console.log('valid:', valid)
  await prisma.$disconnect()
}

main()
