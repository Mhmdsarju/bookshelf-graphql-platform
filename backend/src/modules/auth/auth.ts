import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import type { GraphQLContext } from '../../graphql/context.js';
import { env } from '../../config/env.js';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createToken(user: { id: string; email: string; name: string }) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function requireUser(context: GraphQLContext) {
  if (!context.user) {
    throw new GraphQLError('You must be logged in to perform this action.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user;
}

export async function getUserFromToken(
  token: string | undefined,
  context: Pick<GraphQLContext, 'prisma'>,
) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    if (!payload.sub) return null;
    return await context.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true },
    });
  } catch {
    return null;
  }
}
