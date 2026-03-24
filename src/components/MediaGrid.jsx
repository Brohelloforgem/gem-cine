import MediaCard from './MediaCard';
import './MediaGrid.css';

export default function MediaGrid({ title, items, onPlay }) {
  if (!items || items.length === 0) {
    return (
      <div className="mgrid container">
        <h2 className="mgrid__title">{title}</h2>
        <div className="mgrid__empty">
          <p>No results found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mgrid container">
      <h2 className="mgrid__title">{title}</h2>
      <div className="mgrid__grid">
        {items.map((item, i) => (
          <MediaCard key={item.id + '-grid-' + i} item={item} onPlay={onPlay} index={i} />
        ))}
      </div>
    </div>
  );
}
