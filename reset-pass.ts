import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('Admin1234!', 12)
  await prisma.user.update({
    where: { email: 'admin@dealer.pl' },
    data: { password: hash }
  })
  console.log('✅ Hasło zresetowane')
  await prisma.$disconnect()
}

main()
