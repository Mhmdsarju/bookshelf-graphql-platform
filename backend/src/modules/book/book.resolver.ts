import { GraphQLError } from 'graphql';
import { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../../graphql/context.js';
import { requireUser } from '../auth/auth.js';
import { pubsub, BOOK_CREATED } from '../../graphql/pubsub.js';

const bookOrderField = {
  TITLE: 'title',
  CREATED_AT: 'createdAt',
  PUBLISHED_YEAR: 'publishedYear',
} as const;

export const bookResolvers = {
  Query: {
    book: (_parent: unknown, args: { id: string }, { prisma }: GraphQLContext) =>

      prisma.book.findUnique({ where: { id: args.id } }),

    books: async (
      _parent: unknown,
      args: {
        filter?: {
          search?: string;
          genre?: string;
          status?: string;
          available?: boolean;
          ownerId?: string;
        };
        sort?: { field?: keyof typeof bookOrderField; direction?: 'ASC' | 'DESC' };
        page?: number;
        pageSize?: number;
      },
      { prisma }: GraphQLContext,
    ) => {
      const page = Math.max(1, args.page ?? 1);
      const pageSize = Math.min(50, Math.max(1, args.pageSize ?? 8));
      const filter = args.filter ?? {};
      const where: Prisma.BookWhereInput = {
        ...(filter.genre ? { genre: filter.genre as never } : {}),
        ...(filter.status ? { status: filter.status as never } : {}),
        ...(filter.available !== undefined ? { available: filter.available } : {}),
        ...(filter.ownerId ? { ownerId: filter.ownerId } : {}),
        ...(filter.search
          ? {
              OR: [
                { title: { contains: filter.search, mode: 'insensitive' } },
                { author: { contains: filter.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      };
      const field = bookOrderField[args.sort?.field ?? 'CREATED_AT'] ?? 'createdAt';
      const direction = args.sort?.direction === 'ASC' ? 'asc' : 'desc';
      const [nodes, totalCount] = await Promise.all([
        prisma.book.findMany({
          where,
          orderBy: { [field]: direction },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.book.count({ where }),
      ]);
      const totalPages = Math.ceil(totalCount / pageSize);
      return {
        nodes,
        pageInfo: {
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          currentPage: page,
          totalPages,
        },
      };
    },

    search: async (_parent: unknown, args: { text: string }, { prisma }: GraphQLContext) => {
      const text = args.text.trim();
      if (!text) return [];
      const [books, users] = await Promise.all([
        prisma.book.findMany({
          where: {
            OR: [
              { title: { contains: text, mode: 'insensitive' } },
              { author: { contains: text, mode: 'insensitive' } },
            ],
          },
          take: 10,
        }),
        prisma.user.findMany({
          where: { name: { contains: text, mode: 'insensitive' } },
          take: 10,
          select: { id: true, name: true, email: true, createdAt: true },
        }),
      ]);
      return [...books, ...users];
    },
  },

  Mutation: {
    createBook: async (
      _parent: unknown,
      args: { input: Prisma.BookUncheckedCreateInput },
      context: GraphQLContext,
    ) => {
      const user = requireUser(context);
      const book = await context.prisma.book.create({ data: { ...args.input, ownerId: user.id } });
      await pubsub.publish(BOOK_CREATED, { bookCreated: { book, action: 'CREATED' } });
      return book;
    },

    updateBook: async (
      _parent: unknown,
      args: { id: string; input: Prisma.BookUpdateInput },
      context: GraphQLContext,
    ) => {

      const user = requireUser(context);

      const existing = await context.prisma.book.findUnique({ where: { id: args.id } });

      if (!existing)
        throw new GraphQLError('Book not found.', { extensions: { code: 'NOT_FOUND' } });
      if (existing.ownerId !== user.id)
        throw new GraphQLError('You can only edit your own books.', {
          extensions: { code: 'FORBIDDEN' },
        });
      return context.prisma.book.update({ where: { id: args.id }, data: args.input });
    },

    deleteBook: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const user = requireUser(context);

      const existing = await context.prisma.book.findUnique({ where: { id: args.id } });

      if (!existing)
        throw new GraphQLError('Book not found.', { extensions: { code: 'NOT_FOUND' } });
      if (existing.ownerId !== user.id)
        throw new GraphQLError('You can only delete your own books.', {
          extensions: { code: 'FORBIDDEN' },
        });

      await context.prisma.book.delete({ where: { id: args.id } });

      return true;
    },

    createReview: async (
      _parent: unknown,
      args: { input: { bookId: string; rating: number; comment?: string } },
      context: GraphQLContext,
    ) => {
      const user = requireUser(context);

      if (args.input.rating < 1 || args.input.rating > 5) {
        throw new GraphQLError('Rating must be between 1 and 5.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      return context.prisma.review.upsert({
        where: { bookId_userId: { bookId: args.input.bookId, userId: user.id } },
        create: { ...args.input, userId: user.id },
        update: { rating: args.input.rating, comment: args.input.comment },
      });
    },
  },

  Subscription: {
    bookCreated: {
      subscribe: () => pubsub.asyncIterableIterator([BOOK_CREATED]),
    },
  },

  Book: {
    owner: (book: { ownerId: string }, _args: unknown, context: GraphQLContext) =>
      context.loaders.userById.load(book.ownerId),
    reviews: (book: { id: string }, _args: unknown, context: GraphQLContext) =>
      context.loaders.reviewsByBookId.load(book.id),
    averageRating: async (book: { id: string }, _args: unknown, { prisma }: GraphQLContext) => {
      const result = await prisma.review.aggregate({
        where: { bookId: book.id },
        _avg: { rating: true },
      });
      return result._avg.rating;
    },
  },

  User: {
    books: (user: { id: string }, _args: unknown, { prisma }: GraphQLContext) =>
      prisma.book.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: 'desc' } }),
    reviews: (user: { id: string }, _args: unknown, { prisma }: GraphQLContext) =>
      prisma.review.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
  },

  Review: {
    user: (review: { userId: string }, _args: unknown, context: GraphQLContext) =>
      context.loaders.userById.load(review.userId),
    book: (review: { bookId: string }, _args: unknown, { prisma }: GraphQLContext) =>
      prisma.book.findUnique({ where: { id: review.bookId } }),
  },

  SearchResult: {
    __resolveType(value: { title?: string; author?: string; email?: string }) {
      return 'title' in value ? 'Book' : 'User';
    },
  },

  Node: {
    __resolveType(value: { title?: string; email?: string }) {
      return 'title' in value ? 'Book' : 'User';
    },
  },
};
