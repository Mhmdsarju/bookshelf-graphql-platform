import { GraphQLError } from 'graphql';
import type { GraphQLContext } from '../../graphql/context.js';
import { createToken, hashPassword, verifyPassword } from '../auth/auth.js';

export const userResolvers = {
  Query: {
    me: (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.user) return null;
      return context.prisma.user.findUnique({ where: { id: context.user.id } });
    },
    user: (_parent: unknown, args: { id: string }, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: args.id } }),
    users: (_parent: unknown, _args: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
  },

  Mutation: {
    register: async (
      _parent: unknown,
      args: { name: string; email: string; password: string },
      { prisma }: GraphQLContext,
    ) => {
      if (args.password.length < 8)
        throw new GraphQLError('Password must contain at least 8 characters.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      const email = args.email.trim().toLowerCase();
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists)
        throw new GraphQLError('An account with this email already exists.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      const user = await prisma.user.create({
        data: { name: args.name.trim(), email, passwordHash: await hashPassword(args.password) },
      });
      return { token: createToken(user), user };
    },
    login: async (
      _parent: unknown,
      args: { email: string; password: string },
      { prisma }: GraphQLContext,
    ) => {
      const user = await prisma.user.findUnique({
        where: { email: args.email.trim().toLowerCase() },
      });
      if (!user || !(await verifyPassword(args.password, user.passwordHash))) {
        throw new GraphQLError('Invalid email or password.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return { token: createToken(user), user };
    },
  },
};
