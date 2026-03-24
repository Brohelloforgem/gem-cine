import './Sidebars.css';

export function LeftSidebar({ activeSection = 0, onDotClick }) {
  const dots = [0, 1, 2, 3, 4];
  return (
    <aside className="sidebar sidebar--left">
      <div className="sidebar__icon">🎥</div>
      <div className="sidebar__dots">
        {dots.map(i => (
          <button
            key={i}
            className={`sidebar__dot ${activeSection === i ? 'sidebar__dot--active' : ''}`}
            onClick={() => onDotClick && onDotClick(i)}
            title={`Section ${i + 1}`}
          />
        ))}
      </div>
    </aside>
  );
}

export function RightSidebar() {
  const labels = ['Film Revs', 'Actor Table', 'Movie Stills'];
  return (
    <aside className="sidebar sidebar--right">
      <div className="sidebar__vline" />
      <div className="sidebar__vert-links">
        {labels.map(label => (
          <a key={label} className="sidebar__vert-label" href="#">{label}</a>
        ))}
      </div>
    </aside>
  );
}
