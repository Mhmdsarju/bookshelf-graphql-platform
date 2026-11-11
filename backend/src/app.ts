import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { makeExecutableSchema } from '@graphql-tools/schema';
import type { Express } from 'express';
import type { GraphQLSchema } from 'graphql';

import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { createContext } from './graphql/contextFactory.js';
import { env } from './config/env.js';

type CreateAppResult = {
  app: Express;
  apollo: ApolloServer;
  schema: GraphQLSchema;
};

export async function createApp(): Promise<CreateAppResult> {
  const app = express();

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const apollo = new ApolloServer({
    schema,
    introspection: true,
  });

  await apollo.start();

  app.get('/health', (_req, res) =>
    res.json({
      status: 'ok',
      service: 'bookshelf-api',
    }),
  );

  app.use(
    '/graphql',
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    }),
    express.json(),
    expressMiddleware(apollo, {
      context: createContext,
    }),
  );

  return { app, apollo, schema };
}
