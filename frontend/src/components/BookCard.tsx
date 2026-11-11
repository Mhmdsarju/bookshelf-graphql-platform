import { BookOpen, MoreHorizontal, Star } from 'lucide-react';
import type { Book } from '../types';

const palettes = [
  'cover-sage',
  'cover-rose',
  'cover-blue',
  'cover-sand',
  'cover-lilac',
  'cover-ink',
];

interface Props {
  book: Book;
  index: number;
  onOpen: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  viewerId?: string;
}

export function BookCard({ book, index, onOpen, onEdit, onDelete, viewerId }: Props) {
  const ownBook = viewerId === book.owner.id;
  return (
    <article className="book-card">
      <button
        className={`book-cover ${palettes[index % palettes.length]}`}
        onClick={() => onOpen(book)}
        aria-label={`Open ${book.title}`}
      >
        <span className="cover-top">
          <BookOpen size={17} />
          <span>BOOKSHELF EDITION</span>
        </span>
        <span className="cover-title">{book.title}</span>
        <span className="cover-author">{book.author}</span>
        <span className="cover-bottom">{book.genre.replaceAll('_', ' ')}</span>
      </button>
      <div className="book-info">
        <div className="book-title-row">
          <button className="book-title" onClick={() => onOpen(book)}>
            {book.title}
          </button>
          {ownBook && (
            <div className="menu-wrap">
              <button
                className="icon-button tiny"
                title="Book actions"
                onClick={() => onEdit(book)}
              >
                <MoreHorizontal size={17} />
              </button>
            </div>
          )}
        </div>
        <p className="book-author">
          {book.author} · {book.publishedYear}
        </p>
        <div className="book-meta">
          <span className={`status-pill status-${book.status.toLowerCase()}`}>
            {book.status.replaceAll('_', ' ').toLowerCase()}
          </span>
          <span className="rating">
            <Star size={13} fill="currentColor" />{' '}
            {book.averageRating ? book.averageRating.toFixed(1) : 'New'}
          </span>
        </div>
        {ownBook && (
          <button className="text-button delete-link" onClick={() => onDelete(book)}>
            Remove from shelf
          </button>
        )}
      </div>
    </article>
  );
}
