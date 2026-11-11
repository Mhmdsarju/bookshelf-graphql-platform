import type { Request, Response } from 'express';
import type { PrismaClient } from '@prisma/client';
import type DataLoader from 'dataloader';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface Loaders {
  userById: DataLoader<string, (AuthUser & { createdAt: Date }) | null>;
  reviewsByBookId: DataLoader<
    string,
    Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: Date;
      userId: string;
      bookId: string;
    }>
  >;
}

export interface GraphQLContext {
  req: Request;
  res: Response;
  prisma: PrismaClient;
  user: AuthUser | null;
  loaders: Loaders;
}
