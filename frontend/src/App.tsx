import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import {
  BookOpen,
  Bookmark,
  ChevronDown,
  CirclePlus,
  Command,
  Library,
  LogOut,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { AuthPanel } from './components/AuthPanel';
import { BookCard } from './components/BookCard';
import { BookModal } from './components/BookModal';
import { BookDetails } from './components/BookDetails';
import { BOOK_CREATED, DELETE_BOOK, GET_BOOKS, ME } from './graphql/operations';
import type { Book, BookGenre, BookStatus, Viewer } from './types';

const genres: Array<BookGenre | 'ALL'> = [
  'ALL',
  'FICTION',
  'SELF_HELP',
  'PROGRAMMING',
  'FINANCE',
  'SCIENCE',
  'HISTORY',
  'OTHER',
];
const statuses: Array<BookStatus | 'ALL'> = ['ALL', 'WANT_TO_READ', 'READING', 'COMPLETED'];

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('bookshelf_token'));
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState<BookGenre | 'ALL'>('ALL');
  const [status, setStatus] = useState<BookStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [selected, setSelected] = useState<Book | null>(null);
  const [notice, setNotice] = useState('');
  const { data: meData } = useQuery(ME, { skip: !token });
  const viewer = meData?.me as Viewer | null | undefined;
  const filter = useMemo(
    () => ({
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(genre !== 'ALL' ? { genre } : {}),
      ...(status !== 'ALL' ? { status } : {}),
    }),
    [search, genre, status],
  );
  const { data, loading, error, refetch } = useQuery(GET_BOOKS, {
    variables: { filter, sort: { field: 'CREATED_AT', direction: 'DESC' }, page, pageSize: 8 },
    fetchPolicy: 'cache-and-network',
    skip: !token,
  });
  const [deleteBook] = useMutation(DELETE_BOOK, { refetchQueries: [{ query: GET_BOOKS }] });
  useSubscription(BOOK_CREATED, {
    skip: !token,
    onData: ({ data: result }) => {
      const title = result.data?.bookCreated?.book?.title;
      if (title) {
        setNotice(`A new book was added: ${title}`);
        refetch();
        window.setTimeout(() => setNotice(''), 4500);
      }
    },
  });

  useEffect(() => {
    setPage(1);
  }, [search, genre, status]);

  function authenticated(newToken: string) {
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem('bookshelf_token');
    setToken(null);
    setSelected(null);
    window.location.reload();
  }

  async function removeBook(book: Book) {
    if (!window.confirm(`Remove "${book.title}" from your shelf?`)) return;
    try {
      await deleteBook({ variables: { id: book.id } });
      if (selected?.id === book.id) setSelected(null);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Unable to remove book.');
    }
  }

  if (!token) return <AuthPanel onAuthenticated={authenticated} />;

  const books: Book[] = data?.books?.nodes ?? [];
  const pageInfo = data?.books?.pageInfo;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-icon">
            <BookOpen size={19} />
          </span>
          <span>
            book<span className="brand-light">shelf</span>
            <small>YOUR READING SPACE</small>
          </span>
        </a>
        <div className="side-label">LIBRARY</div>
        <button className="side-link active">
          <Library size={17} /> My collection{' '}
          <span className="side-count">{pageInfo?.totalCount ?? '—'}</span>
        </button>
        <button
          className="side-link"
          onClick={() => {
            setStatus('WANT_TO_READ');
            setSelected(null);
          }}
        >
          <Bookmark size={17} /> Want to read
        </button>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <Sparkles size={17} />
            <strong>A thought for today</strong>
            <p>“A reader lives a thousand lives before he dies.”</p>
            <small>— George R. R. Martin</small>
          </div>
          <div className="profile-row">
            <div className="avatar">{viewer?.name?.slice(0, 1).toUpperCase() ?? 'R'}</div>
            <div className="profile-copy">
              <strong>{viewer?.name ?? 'Reader'}</strong>
              <small>{viewer?.email ?? ''}</small>
            </div>
            <button className="icon-button" onClick={logout} title="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Library <span>/</span> My collection
          </div>
          <div className="topbar-right">
            <span className="date-label">
              {new Intl.DateTimeFormat('en', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }).format(new Date())}
            </span>
            <div className="avatar avatar-small">
              {viewer?.name?.slice(0, 1).toUpperCase() ?? 'R'}
            </div>
          </div>
        </header>
        {selected ? (
          <BookDetails book={selected} onBack={() => setSelected(null)} />
        ) : (
          <>
            <section className="welcome-section">
              <div>
                <p className="eyebrow">MONDAY, YOUR WAY</p>
                <h1>
                  Your next chapter
                  <br />
                  <em>starts here.</em>
                </h1>
                <p className="welcome-subtitle">
                  A home for the books you love and the ideas you collect.
                </p>
              </div>
              <div className="welcome-art">
                <div className="sun-disc" />
                <div className="mini-book mini-book-a" />
                <div className="mini-book mini-book-b" />
                <div className="mini-book mini-book-c" />
              </div>
            </section>
            <section className="stats-row">
              <div className="stat-card">
                <span className="stat-icon">
                  <BookOpen size={17} />
                </span>
                <div>
                  <strong>{pageInfo?.totalCount ?? '—'}</strong>
                  <small>Books on your shelf</small>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon peach">
                  <Bookmark size={17} />
                </span>
                <div>
                  <strong>{books.filter((book) => book.status === 'COMPLETED').length}</strong>
                  <small>Completed on this page</small>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon lavender">
                  <Sparkles size={17} />
                </span>
                <div>
                  <strong>{books.filter((book) => book.status === 'READING').length}</strong>
                  <small>Currently reading on this page</small>
                </div>
              </div>
            </section>
            <section className="collection-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">THE PERSONAL LIBRARY</p>
                  <h2>
                    Your collection{' '}
                    <span className="heading-count">{pageInfo?.totalCount ?? 0}</span>
                  </h2>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    setEditing(null);
                    setModalOpen(true);
                  }}
                >
                  <CirclePlus size={17} /> Add a book
                </button>
              </div>
              <div className="toolbar">
                <div className="search-box">
                  <Search size={17} />
                  <input
                    placeholder="Search by title or author…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch('')}>
                      <X size={14} />
                    </button>
                  )}
                  <kbd>
                    <Command size={11} /> K
                  </kbd>
                </div>
                <div className="filter-control">
                  <SlidersHorizontal size={16} />
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as BookGenre | 'ALL')}
                  >
                    {genres.map((item) => (
                      <option key={item} value={item}>
                        {item === 'ALL' ? 'All genres' : item.replaceAll('_', ' ')}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
                <div className="filter-control">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BookStatus | 'ALL')}
                  >
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {item === 'ALL' ? 'All statuses' : item.replaceAll('_', ' ')}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </div>
              {notice && (
                <div className="notice">
                  <Sparkles size={16} />
                  {notice}
                </div>
              )}
              {loading && <div className="loading-state">Gathering your books…</div>}
              {error && (
                <div className="error-banner">
                  {error.message} — Check that the backend and database are running.
                </div>
              )}
              {!loading && !error && books.length === 0 && (
                <div className="empty-state">
                  <div>
                    <BookOpen size={28} />
                  </div>
                  <h3>No books found</h3>
                  <p>Try a different search or add a new book to your shelf.</p>
                  <button className="primary-button" onClick={() => setModalOpen(true)}>
                    Add your first book
                  </button>
                </div>
              )}
              <div className="book-grid">
                {books.map((book, index) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={index}
                    onOpen={setSelected}
                    onEdit={(item) => {
                      setEditing(item);
                      setModalOpen(true);
                    }}
                    onDelete={removeBook}
                    viewerId={viewer?.id}
                  />
                ))}
              </div>
              {pageInfo && pageInfo.totalPages > 1 && (
                <div className="pagination">
                  <span>
                    Page {pageInfo.currentPage} of {pageInfo.totalPages}
                  </span>
                  <div>
                    <button
                      disabled={!pageInfo.hasPreviousPage}
                      onClick={() => setPage((value) => value - 1)}
                    >
                      Previous
                    </button>
                    <button
                      disabled={!pageInfo.hasNextPage}
                      onClick={() => setPage((value) => value + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
        <footer className="footer">
          <span>BOOKSHELF © 2026</span>
          <span>
            Made for the love of reading <span className="heart">♥</span>
          </span>
        </footer>
      </main>
      {modalOpen && (
        <BookModal
          book={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
