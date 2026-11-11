import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime

  enum BookGenre {
    FICTION
    SELF_HELP
    PROGRAMMING
    FINANCE
    SCIENCE
    HISTORY
    OTHER
  }

  enum BookStatus {
    WANT_TO_READ
    READING
    COMPLETED
  }

  enum SortDirection {
    ASC
    DESC
  }

  enum BookSortField {
    TITLE
    CREATED_AT
    PUBLISHED_YEAR
  }

  interface Node {
    id: ID!
  }

  type User implements Node {
    id: ID!
    name: String!
    email: String!
    createdAt: DateTime!
    books: [Book!]!
    reviews: [Review!]!
  }

  type Book implements Node {
    id: ID!
    title: String!
    author: String!
    description: String
    genre: BookGenre!
    publishedYear: Int!
    available: Boolean!
    status: BookStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    owner: User!
    reviews: [Review!]!
    averageRating: Float
  }

  type Review implements Node {
    id: ID!
    rating: Int!
    comment: String
    createdAt: DateTime!
    user: User!
    book: Book!
  }

  union SearchResult = Book | User

  input BookFilterInput {
    search: String
    genre: BookGenre
    status: BookStatus
    available: Boolean
    ownerId: ID
  }

  input BookSortInput {
    field: BookSortField = CREATED_AT
    direction: SortDirection = DESC
  }

  input CreateBookInput {
    title: String!
    author: String!
    description: String
    genre: BookGenre!
    publishedYear: Int!
    available: Boolean = true
    status: BookStatus = WANT_TO_READ
  }

  input UpdateBookInput {
    title: String
    author: String
    description: String
    genre: BookGenre
    publishedYear: Int
    available: Boolean
    status: BookStatus
  }

  input CreateReviewInput {
    bookId: ID!
    rating: Int!
    comment: String
  }

  type PageInfo {
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }

  type BookConnection {
    nodes: [Book!]!
    pageInfo: PageInfo!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type BookEvent {
    book: Book!
    action: String!
  }

  type Query {
    health: String!
    me: User
    user(id: ID!): User
    users: [User!]!
    book(id: ID!): Book
    books(
      filter: BookFilterInput
      sort: BookSortInput
      page: Int = 1
      pageSize: Int = 8
    ): BookConnection!
    search(text: String!): [SearchResult!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createBook(input: CreateBookInput!): Book!
    updateBook(id: ID!, input: UpdateBookInput!): Book!
    deleteBook(id: ID!): Boolean!
    createReview(input: CreateReviewInput!): Review!
  }

  type Subscription {
    bookCreated: BookEvent!
  }
`;
