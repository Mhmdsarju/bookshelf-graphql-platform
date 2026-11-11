# BookShelf — Full-stack GraphQL learning project

A compact full-stack book library built with React + TypeScript, Apollo Client, Node.js,
Express 5, Apollo Server, Prisma and PostgreSQL.

## Requirements

- Node.js 20+
- npm 10+
- Docker Desktop (recommended for PostgreSQL), or a local PostgreSQL server

## Quick start

### 1. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with:

- database: `bookshelf`
- username: `bookshelf`
- password: `bookshelf_dev_password`

### 2. Configure and start the backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Backend: http://localhost:4000/graphql

Demo accounts (seed script):

- `demo@bookshelf.dev` / `Password123!`
- `reader@bookshelf.dev` / `Password123!`

### 3. Start the frontend

Open another terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: http://localhost:5173

### 4. Run checks

Backend:

```bash
cd backend
npm run typecheck
npm test
```

Frontend:

```bash
cd frontend
npm run typecheck
npm run build
```

## Features

- Register/login with JWT; authenticated users can create, update and delete their own books.
- Browse, search, filter, sort and paginate books.
- Book details, reviews and user/book relationships.
- GraphQL queries, mutations, variables, aliases, fragments, built-in directives,
  enums, input objects, interfaces, unions, custom DateTime scalar and nested resolvers.
- GraphQL subscriptions over WebSocket for book-created events.
- DataLoader batching for book owners and reviews.
- Apollo Client queries, mutations, cache updates and subscriptions.
- A small isolated schema-stitching demonstration in `backend/src/stitching/demo.ts`.

## Notes

- The main application uses PostgreSQL through Prisma.
- Subscriptions use an in-memory PubSub instance. This is suitable for local learning;
  production multi-instance deployments should use a shared PubSub adapter.
- JWT is kept in localStorage in this learning app for simplicity. For production,
  prefer secure HttpOnly cookies and review CSRF/CORS settings.
- The schema-stitching file is a self-contained demonstration and is not required
  for the main application to run.
- The project is intentionally compact. Learn it file-by-file after confirming it runs.
