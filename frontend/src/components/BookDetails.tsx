import { useQuery } from '@apollo/client';
import { ArrowLeft, BookOpen, Star } from 'lucide-react';
import { GET_BOOK } from '../graphql/operations';
import type { Book } from '../types';

interface Props {
  book: Book;
  onBack: () => void;
}

export function BookDetails({ book, onBack }: Props) {
  const { data, loading, error } = useQuery(GET_BOOK, { variables: { id: book.id } });
  const detail = data?.book;
  return (
    <section className="detail-page">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={16} /> Back to my shelf
      </button>
      <div className="detail-layout">
        <div className="detail-cover">
          <BookOpen size={34} />
          <span>{book.title}</span>
          <small>{book.author}</small>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">BOOK DETAILS</p>
          <h1>{book.title}</h1>
          <p className="detail-author">by {book.author}</p>
          <div className="detail-tags">
            <span>{book.genre.replaceAll('_', ' ')}</span>
            <span>{book.publishedYear}</span>
            <span>{book.status.replaceAll('_', ' ')}</span>
          </div>
          <p className="detail-description">
            {book.description || 'No description has been added yet.'}
          </p>
          <div className="detail-stats">
            <div>
              <strong>{detail?.reviews?.length ?? 0}</strong>
              <span>Reviews</span>
            </div>
            <div>
              <strong>{detail?.averageRating ? detail.averageRating.toFixed(1) : '—'}</strong>
              <span>Average rating</span>
            </div>
            <div>
              <strong>{book.available ? 'Available' : 'Unavailable'}</strong>
              <span>Availability</span>
            </div>
          </div>
        </div>
      </div>
      <div className="reviews-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">COMMUNITY NOTES</p>
            <h2>Reader reviews</h2>
          </div>
        </div>
        {loading && <p className="muted">Loading reviews…</p>}
        {error && <p className="error-text">{error.message}</p>}
        {!loading && detail?.reviews?.length === 0 && (
          <p className="empty-inline">No reviews yet. Be the first to share a thought.</p>
        )}
        {detail?.reviews?.map(
          (review: { id: string; rating: number; comment?: string; user: { name: string } }) => (
            <div className="review-row" key={review.id}>
              <div className="avatar">{review.user.name.slice(0, 1).toUpperCase()}</div>
              <div>
                <strong>{review.user.name}</strong>
                <div className="rating">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </div>
                <p>{review.comment}</p>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
