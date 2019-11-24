import { Prisma } from '../generated/prisma-client'

export interface MyContext {
  prisma: Prisma
  userId: string
}
