import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpUri = import.meta.env.VITE_GRAPHQL_HTTP_URL ?? 'http://localhost:4000/graphql';
const wsUri = import.meta.env.VITE_GRAPHQL_WS_URL ?? 'ws://localhost:4000/graphql';

const httpLink = new HttpLink({ uri: httpUri });
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('bookshelf_token');
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUri,
    connectionParams: () => {
      const token = localStorage.getItem('bookshelf_token');
      return token ? { authorization: `Bearer ${token}` } : {};
    },
    retryAttempts: 5,
  }),
);

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink),
);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          books: {
            keyArgs: ['filter', 'sort', 'page', 'pageSize'],
          },
        },
      },
    },
  }),
});
