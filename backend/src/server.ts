import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { createApp } from './app.js';
import { env } from './config/env.js';
// import { createContext } from './graphql/context.js';
import { prisma } from './config/prisma.js';
import { createLoaders } from './graphql/loaders.js';
import { getUserFromToken } from './modules/auth/auth.js';

async function bootstrap() {
  const { app, apollo, schema } = await createApp();
  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

  const cleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const authorization = ctx.connectionParams?.authorization;
        const token =
          typeof authorization === 'string' && authorization.startsWith('Bearer ')
            ? authorization.slice(7)
            : undefined;
        const user = await getUserFromToken(token, { prisma });
        return { req: {} as never, res: {} as never, prisma, user, loaders: createLoaders(prisma) };
      },
    },
    wsServer,
  );

  httpServer.listen(env.PORT, () => {
    console.log(`BookShelf API: http://localhost:${env.PORT}/graphql`);
    console.log(`GraphQL WebSocket: ws://localhost:${env.PORT}/graphql`);
  });

  const shutdown = async () => {
    await cleanup.dispose();
    wsServer.close();
    await apollo.stop();
    await prisma.$disconnect();
    httpServer.close();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch(async (error) => {
  console.error('Failed to start BookShelf:', error);
  await prisma.$disconnect();
  process.exit(1);
});
