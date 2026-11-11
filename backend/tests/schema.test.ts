import { describe, expect, it } from 'vitest';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from '../src/graphql/schema.js';

describe('BookShelf GraphQL schema', () => {
  it('validates a health query schema', async () => {
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers: { Query: { health: () => 'ok' } },
    });
    const result = await graphql({ schema, source: '{ health }' });
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({ health: 'ok' });
  });

  it('rejects an unknown enum value at validation time', async () => {
    const schema = makeExecutableSchema({ typeDefs, resolvers: {} });
    const result = await graphql({
      schema,
      source:
        '{ books(filter: { genre: "NOT_A_GENRE" }) { nodes { id } pageInfo { totalCount hasNextPage hasPreviousPage currentPage totalPages } } }',
    });
    expect(result.errors?.length).toBeGreaterThan(0);
  });
});
