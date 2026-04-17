import './EditorialModal.css';

export default function EditorialModal({ title, onClose }) {
  const contentMap = {
    'Film Revs': (
      <div className="editorial-content">
        <h3>Masterpieces in Motion</h3>
        <p className="editorial-date">April 2026 Edition</p>
        <p>
          The latest releases push the boundaries of modern storytelling. "Neon Echoes" 
          brings a visceral, neon-drenched aesthetic that redefines sci-fi noir. 
          Its breathtaking visuals are matched only by a subtle, ambient score...
        </p>
        <p>
          Meanwhile, classic thrillers are seeing a resurgence, drawing heavily on 
          analog techniques and slow-burn tension to command audience attention.
        </p>
      </div>
    ),
    'Actor Table': (
      <div className="editorial-content">
        <p className="editorial-date">Featured Performers</p>
        <table className="actor-table">
          <thead>
            <tr>
              <th>Star</th>
              <th>Known For</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Anya Taylor-Joy</td><td>The Queen's Gambit</td><td>⭐⭐⭐⭐⭐</td></tr>
            <tr><td>Oscar Isaac</td><td>Dune</td><td>⭐⭐⭐⭐⭐</td></tr>
            <tr><td>Florence Pugh</td><td>Midsommar</td><td>⭐⭐⭐⭐</td></tr>
            <tr><td>Cillian Murphy</td><td>Oppenheimer</td><td>⭐⭐⭐⭐⭐</td></tr>
          </tbody>
        </table>
      </div>
    ),
    'Movie Stills': (
      <div className="editorial-content">
        <p className="editorial-date">Curated Exhibition</p>
        <div className="stills-grid">
          <div className="still" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80')" }}></div>
          <div className="still" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80')" }}></div>
          <div className="still" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80')" }}></div>
          <div className="still" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=600&q=80')" }}></div>
        </div>
      </div>
    )
  };

  return (
    <div className="editorial-overlay" onClick={onClose}>
      <div className="editorial-modal anim-fade-up" onClick={e => e.stopPropagation()}>
        <button className="editorial-close" onClick={onClose}>×</button>
        <h2 className="editorial-title">{title}</h2>
        <div className="editorial-body">
          {contentMap[title] || <p>Feature in development.</p>}
        </div>
      </div>
    </div>
  );
}
