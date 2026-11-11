/**
 * Standalone learning demo: stitch two tiny local GraphQL schemas.
 * This is intentionally separate from the main BookShelf API.
 */
import { makeExecutableSchema } from '@graphql-tools/schema';
import { stitchSchemas } from '@graphql-tools/stitch';
import { graphql } from 'graphql';

const booksService = makeExecutableSchema({
  typeDefs: `type Book { id: ID!, title: String! } type Query { books: [Book!]! }`,
  resolvers: { Query: { books: () => [{ id: 'b1', title: 'Atomic Habits' }] } },
});

const authorsService = makeExecutableSchema({
  typeDefs: `type Author { id: ID!, name: String! } type Query { authors: [Author!]! }`,
  resolvers: { Query: { authors: () => [{ id: 'a1', name: 'James Clear' }] } },
});

export const stitchedSchema = stitchSchemas({ subschemas: [booksService, authorsService] });

export async function runStitchingDemo() {
  return graphql({
    schema: stitchedSchema,
    source: `{ books { id title } authors { id name } }`,
  });
}
