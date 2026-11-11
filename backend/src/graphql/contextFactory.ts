import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { createLoaders } from './loaders.js';
import { getUserFromToken } from '../modules/auth/auth.js';
import type { GraphQLContext } from './context.js';

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<GraphQLContext> {
  const authorization = req.headers.authorization;

  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : undefined;

  const user = await getUserFromToken(token, { prisma });

  return {
    req,
    res,
    prisma,
    user,
    loaders: createLoaders(prisma),
  };
}