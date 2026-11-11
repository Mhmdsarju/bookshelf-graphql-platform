import { useEffect, useState, type FormEvent } from 'react';
import { useMutation } from '@apollo/client';
import { X } from 'lucide-react';
import { CREATE_BOOK, GET_BOOKS, UPDATE_BOOK } from '../graphql/operations';
import type { Book, BookGenre, BookStatus } from '../types';

const genres: BookGenre[] = [
  'FICTION',
  'SELF_HELP',
  'PROGRAMMING',
  'FINANCE',
  'SCIENCE',
  'HISTORY',
  'OTHER',
];
const statuses: BookStatus[] = ['WANT_TO_READ', 'READING', 'COMPLETED'];

interface Props {
  onClose: () => void;
  book?: Book | null;
}

export function BookModal({ onClose, book }: Props) {
  const [title, setTitle] = useState(book?.title ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [description, setDescription] = useState(book?.description ?? '');
  const [genre, setGenre] = useState<BookGenre>(book?.genre ?? 'FICTION');
  const [publishedYear, setPublishedYear] = useState(
    String(book?.publishedYear ?? new Date().getFullYear()),
  );
  const [status, setStatus] = useState<BookStatus>(book?.status ?? 'WANT_TO_READ');
  const [error, setError] = useState('');
  const [createBook, createState] = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: GET_BOOKS }],
  });
  const [updateBook, updateState] = useMutation(UPDATE_BOOK, {
    refetchQueries: [{ query: GET_BOOKS }],
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const input = {
      title,
      author,
      description: description || null,
      genre,
      publishedYear: Number(publishedYear),
      status,
    };
    try {
      if (book) await updateBook({ variables: { id: book.id, input } });
      else await createBook({ variables: { input } });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save book.');
    }
  }

  const loading = createState.loading || updateState.loading;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal-card">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">YOUR COLLECTION</p>
            <h2>{book ? 'Edit book' : 'Add a new book'}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        <form onSubmit={submit} className="form-stack">
          <label>
            Book title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={1}
            />
          </label>
          <label>
            Author
            <input value={author} onChange={(e) => setAuthor(e.target.value)} required />
          </label>
          <div className="form-row">
            <label>
              Genre
              <select value={genre} onChange={(e) => setGenre(e.target.value as BookGenre)}>
                {genres.map((item) => (
                  <option key={item} value={item}>
                    {item.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Published year
              <input
                type="number"
                min="0"
                max="2100"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                required
              />
            </label>
          </div>
          <label>
            Reading status
            <select value={status} onChange={(e) => setStatus(e.target.value as BookStatus)}>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label>
            A little about this book
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short note…"
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button" disabled={loading}>
              {loading ? 'Saving…' : book ? 'Save changes' : 'Add to shelf'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
