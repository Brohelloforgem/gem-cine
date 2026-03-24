import { useWatchlist } from '../hooks/useWatchlist';
import './MediaCard.css';

export default function MediaCard({ item, onPlay, index = 0 }) {
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    toggleWatchlist(item);
  };

  const added = isInWatchlist(item.id);

  return (
    <div
      className="mcard"
      onClick={() => onPlay(item)}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="mcard__poster-wrap">
        <img
          className="mcard__poster"
          src={item.poster}
          alt={item.title}
          loading="lazy"
        />
        <div className="mcard__overlay">
          <button className="mcard__play">▶</button>
        </div>
        <button
          className={`mcard__watchlist ${added ? 'mcard__watchlist--added' : ''}`}
          onClick={handleWatchlistClick}
          title={added ? 'Remove' : 'Add to list'}
        >
          {added ? '✓' : '+'}
        </button>
      </div>

      <div className="mcard__info">
        <p className="mcard__genre">
          {item.mediaType === 'tv' ? 'TV Series' : 'Movie'}
        </p>
        <h4 className="mcard__title">{item.title}</h4>
        <span className="mcard__rating">
          <span className="mcard__star">★</span>
          {item.rating?.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
