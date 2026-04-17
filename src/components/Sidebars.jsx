import './Sidebars.css';

export function LeftSidebar({ activeSection = 0, onDotClick }) {
  const dots = [0, 1, 2, 3, 4];
  
  const handleDotClick = (i) => {
    if (onDotClick) onDotClick(i);
    // Scroll down based on dot index
    window.scrollTo({ top: i * window.innerHeight * 0.8, behavior: 'smooth' });
  };

  return (
    <aside className="sidebar sidebar--left">
      <div 
        className="sidebar__icon" 
        style={{ cursor: 'pointer' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to Top"
      >🎥</div>
      <div className="sidebar__dots">
        {dots.map(i => (
          <button
            key={i}
            className={`sidebar__dot ${activeSection === i ? 'sidebar__dot--active' : ''}`}
            onClick={() => handleDotClick(i)}
            title={`Scroll to Section ${i + 1}`}
          />
        ))}
      </div>
    </aside>
  );
}

export function RightSidebar({ onFeatureClick }) {
  const labels = ['Film Revs', 'Actor Table', 'Movie Stills'];
  
  const handleLinkClick = (e, label) => {
    e.preventDefault();
    if (onFeatureClick) onFeatureClick(label);
  };

  return (
    <aside className="sidebar sidebar--right">
      <div className="sidebar__vline" />
      <div className="sidebar__vert-links">
        {labels.map(label => (
          <a 
            key={label} 
            className="sidebar__vert-label" 
            href="#"
            onClick={(e) => handleLinkClick(e, label)}
          >
            {label}
          </a>
        ))}
      </div>
    </aside>
  );
}
