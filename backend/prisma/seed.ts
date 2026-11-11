import 'dotenv/config';
import { PrismaClient, BookGenre, BookStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@bookshelf.dev' },
    update: {},
    create: { name: 'Demo Reader', email: 'demo@bookshelf.dev', passwordHash },
  });

  const reader = await prisma.user.upsert({
    where: { email: 'reader@bookshelf.dev' },
    update: {},
    create: { name: 'Book Lover', email: 'reader@bookshelf.dev', passwordHash },
  });

  const sampleBooks = [
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      description: 'A practical guide to building better habits.',
      genre: BookGenre.SELF_HELP,
      publishedYear: 2018,
      status: BookStatus.COMPLETED,
      ownerId: demo.id,
    },
    {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      description: 'A journey about following your dreams.',
      genre: BookGenre.FICTION,
      publishedYear: 1988,
      status: BookStatus.READING,
      ownerId: demo.id,
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      description: 'A guide to writing readable and maintainable software.',
      genre: BookGenre.PROGRAMMING,
      publishedYear: 2008,
      status: BookStatus.WANT_TO_READ,
      ownerId: reader.id,
    },
    {
      title: 'Rich Dad Poor Dad',
      author: 'Robert T. Kiyosaki',
      description: 'Lessons about financial education.',
      genre: BookGenre.FINANCE,
      publishedYear: 1997,
      status: BookStatus.COMPLETED,
      ownerId: reader.id,
    },
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      description: 'An introduction to cosmology.',
      genre: BookGenre.SCIENCE,
      publishedYear: 1988,
      status: BookStatus.WANT_TO_READ,
      ownerId: demo.id,
    },
  ];

  for (const book of sampleBooks) {
    const exists = await prisma.book.findFirst({
      where: { title: book.title, ownerId: book.ownerId },
    });
    if (!exists) await prisma.book.create({ data: book });
  }

  console.log('Seed complete. Demo accounts use Password123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
