export type BookGenre =
  'FICTION' | 'SELF_HELP' | 'PROGRAMMING' | 'FINANCE' | 'SCIENCE' | 'HISTORY' | 'OTHER';
export type BookStatus = 'WANT_TO_READ' | 'READING' | 'COMPLETED';

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  genre: BookGenre;
  publishedYear: number;
  available: boolean;
  status: BookStatus;
  averageRating?: number | null;
  owner: { id: string; name: string };
}

export interface Viewer {
  id: string;
  name: string;
  email: string;
}
