import { gql } from '@apollo/client';

export const BOOK_FIELDS = gql`
  fragment BookFields on Book {
    id
    title
    author
    description
    genre
    publishedYear
    available
    status
    createdAt
    averageRating
    owner {
      id
      name
    }
  }
`;

export const GET_BOOKS = gql`
  ${BOOK_FIELDS}
  query GetBooks($filter: BookFilterInput, $sort: BookSortInput, $page: Int, $pageSize: Int) {
    books(filter: $filter, sort: $sort, page: $page, pageSize: $pageSize) {
      nodes {
        ...BookFields
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
      }
    }
  }
`;

export const GET_BOOK = gql`
  ${BOOK_FIELDS}
  query GetBook($id: ID!) {
    book(id: $id) {
      ...BookFields
      reviews {
        id
        rating
        comment
        createdAt
        user {
          id
          name
        }
      }
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      name
      email
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const CREATE_BOOK = gql`
  ${BOOK_FIELDS}
  mutation CreateBook($input: CreateBookInput!) {
    createBook(input: $input) {
      ...BookFields
    }
  }
`;

export const UPDATE_BOOK = gql`
  ${BOOK_FIELDS}
  mutation UpdateBook($id: ID!, $input: UpdateBookInput!) {
    updateBook(id: $id, input: $input) {
      ...BookFields
    }
  }
`;

export const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id)
  }
`;

export const BOOK_CREATED = gql`
  subscription BookCreated {
    bookCreated {
      action
      book {
        id
        title
        author
        genre
      }
    }
  }
`;
