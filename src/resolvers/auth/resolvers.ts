import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { MutationResolvers, QueryResolvers } from '../../types'

interface Resolvers {
  Mutation: MutationResolvers
  Query: QueryResolvers
}

export const resolvers: Resolvers = {
  Query: {
    me: async (parent, variables, { prisma, userId }) => {
      const user = prisma.user({ id: userId })
      return user
    }
  },
  Mutation: {
    signup: async (parent, variables, { prisma }) => {
      try {
        const { password } = variables
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.createUser({
          ...variables,
          password: hashedPassword
        })

        return {
          token: jwt.sign({ user: user.id }, process.env.APP_SECRET),
          user
        }
      } catch (e) {
        console.log(e)
        return e
      }
    },
    login: async (parent, variables, { prisma }) => {
      try {
        const { password, email } = variables
        const user = await prisma.user({
          email
        })

        if (!user) {
          throw Error(`No such user found for email: ${email}`)
        }

        const valid = await bcrypt.compare(password, user.password)

        if (!valid) {
          throw Error('Invalid password')
        }

        return {
          token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
          user
        }
      } catch (e) {
        console.log(e)
        return e
      }
    }
  }
}
