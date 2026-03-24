import { useWatchlist } from '../hooks/useWatchlist';
import './Hero.css';

function StarRating({ score }) {
  const maxStars = 5;
  const filled = Math.round((score / 10) * maxStars);
  return (
    <span className="hero__stars">
      {Array.from({ length: maxStars }).map((_, i) => (
        <span key={i} className={i < filled ? 'star--filled' : 'star--empty'}>★</span>
      ))}
    </span>
  );
}

export default function Hero({ movie, onPlay }) {
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  if (!movie) return (
    <div className="hero hero--skeleton" />
  );

  const scorePercent = Math.round((movie.rating / 10) * 100);
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';

  return (
    <section className="hero">
      {/* Background */}
      <div
        className="hero__bg"
        style={{ backgroundImage: `url(${movie.background || movie.poster})` }}
      />
      {/* Gradient overlay — left to right */}
      <div className="hero__overlay" />

      {/* Content */}
      <div className="hero__content container">
        <p className="hero__eyebrow anim-fade-up">
          {movie.mediaType === 'tv' ? 'Series' : 'Feature Film'} &nbsp;·&nbsp; {year}
        </p>

        <h1 className="hero__title anim-slide-in">
          {(movie.title || movie.name || '').toUpperCase()}
        </h1>

        <div className="hero__score anim-fade-up" style={{ animationDelay: '0.2s' }}>
          <span className="hero__score-label">Score</span>
          <StarRating score={movie.rating} />
          <span className="hero__score-pct">{scorePercent}%</span>
        </div>

        <p className="hero__synopsis anim-fade-up" style={{ animationDelay: '0.3s' }}>
          {movie.overview}
        </p>

        <div className="hero__actions anim-fade-up" style={{ animationDelay: '0.45s' }}>
          <button className="btn-play" onClick={() => onPlay(movie)}>
            <span className="btn-play__icon">▶</span>
            Play Video
          </button>
          <button
            className={`hero__watchlist-btn ${isInWatchlist(movie.id) ? 'hero__watchlist-btn--added' : ''}`}
            onClick={() => toggleWatchlist(movie)}
            title={isInWatchlist(movie.id) ? 'Remove from list' : 'Add to list'}
          >
            {isInWatchlist(movie.id) ? '✓ In List' : '+ My List'}
          </button>
        </div>
      </div>
    </section>
  );
}
