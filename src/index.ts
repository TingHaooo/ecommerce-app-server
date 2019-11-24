import path from 'path'
import fs from 'fs'
import glob from 'glob'
import dotenv from 'dotenv'
import express from 'express'
import { mergeTypes, mergeResolvers } from 'merge-graphql-schemas'
import { ApolloServer, gql } from 'apollo-server-express'
import { prisma } from '../generated/prisma-client/index'
import { express as voyagerMiddleware } from 'graphql-voyager/middleware'
// import { getUser } from './utils'

dotenv.config()

const pathToModules = path.join(__dirname)
const allTypes = glob
  .sync(`${pathToModules}/**/*.graphql`)
  .map(x => fs.readFileSync(x, { encoding: 'utf8' }))

const allResolvers = glob
  .sync(`${pathToModules}/**/resolvers.?s`)
  .map(resolver => require(resolver).resolvers)

// @ts-ignore
const typeDefs = gql(mergeTypes(allTypes, { all: true }))
const resolvers = mergeResolvers(allResolvers)

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: (req: any) => {
    /**
     * @TODO: waiting for client req header setting
     */
    // const tokenWithBearer = req.headers.authorization || ''
    // const token = tokenWithBearer.split(' ')[1]
    // const userId = getUser(token)
    return {
      // userId,
      prisma
    }
  }
})

const app = express()

app.use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql' }))

server.applyMiddleware({ app })

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000/graphql`)
)
