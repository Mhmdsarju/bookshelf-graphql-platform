import { mergeResolvers } from '@graphql-tools/merge';
import { bookResolvers } from '../modules/book/book.resolver.js';
import { userResolvers } from '../modules/user/user.resolver.js';
import { DateTimeScalar } from './scalars.js';

export const resolvers = mergeResolvers([

  { DateTime: DateTimeScalar },
  bookResolvers,
  userResolvers,
  {
    Query: {
      health: () => 'BookShelf GraphQL API is healthy!',
    },
  },
]);
