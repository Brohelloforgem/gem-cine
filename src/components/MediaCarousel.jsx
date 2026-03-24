import { useRef } from 'react';
import MediaCard from './MediaCard';
import './MediaCarousel.css';

export default function MediaCarousel({ title, items, onPlay }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="carousel">
      <div className="carousel__header container">
        <h2 className="carousel__title">{title}</h2>
        <div className="carousel__nav">
          <button className="carousel__arrow" onClick={() => scroll('left')}>‹</button>
          <button className="carousel__arrow" onClick={() => scroll('right')}>›</button>
        </div>
      </div>

      <div className="carousel__track-wrap">
        <div className="carousel__track" ref={rowRef}>
          {items.map((item, i) => (
            <div key={item.id ? `${item.id}-${i}` : i} className="carousel__item">
              <MediaCard item={item} onPlay={onPlay} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
