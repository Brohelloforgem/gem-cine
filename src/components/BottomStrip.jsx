import './BottomStrip.css';

const GENRE_MAP = {
  28: 'Action', 35: 'Comedy', 18: 'Drama', 27: 'Horror',
  10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller', 10765: 'Sci-Fi & Fantasy',
  10759: 'Action & Adv.', 16: 'Animation',
};

export default function BottomStrip({ items = [], onPlay }) {
  const strip = items.slice(0, 5);

  return (
    <div className="bstrip glass">
      {strip.map((item, i) => (
        <div key={item.id ? `${item.id}-bstrip` : i} className="bstrip__item" onClick={() => onPlay(item)}>
          {i > 0 && <div className="bstrip__divider" />}
          <div className="bstrip__content">
            <img
              className="bstrip__thumb"
              src={item.poster || 'https://via.placeholder.com/500x750?text=No+Poster'}
              alt={item.title || 'Media Poster'}
              loading="lazy"
            />
            <div className="bstrip__info">
              <p className="bstrip__genre">
                {item.mediaType === 'tv' ? 'Series' : 'Film'}
              </p>
              <h4 className="bstrip__title">{item.title || 'Untitled'}</h4>
              <button className="bstrip__more">MORE ▶</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
