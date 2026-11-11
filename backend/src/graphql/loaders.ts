import DataLoader from 'dataloader';
import type { PrismaClient } from '@prisma/client';

export function createLoaders(prisma: PrismaClient) {
  return {
    userById: new DataLoader(async (ids: readonly string[]) => {
      const users = await prisma.user.findMany({
        where: { id: { in: [...ids] } },
        select: { id: true, name: true, email: true, createdAt: true },
      });
      const byId = new Map(users.map((user) => [user.id, user]));
      return ids.map((id) => byId.get(id) ?? null);
    }),
    reviewsByBookId: new DataLoader(async (bookIds: readonly string[]) => {
      const reviews = await prisma.review.findMany({
        where: { bookId: { in: [...bookIds] } },
        orderBy: { createdAt: 'desc' },
      });
      return bookIds.map((id) => reviews.filter((review) => review.bookId === id));
    }),
  };
}
