import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar({ onSearch, onCategoryChange, activeCategory }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      onSearch(searchInput);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { id: 'home',    label: 'Home' },
    { id: 'popular', label: 'Category' },
    { id: 'movie',   label: 'Movies' },
    { id: 'tv',      label: 'Cinema' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      {/* Logo */}
      <div className="navbar__logo" onClick={() => onCategoryChange('home')}>
        <span className="navbar__gem">💎</span>
        <span className="navbar__name">GEM CINE</span>
      </div>

      {/* Center links */}
      <ul className="navbar__links">
        {navLinks.map(link => (
          <li key={link.id} className={`navbar__item ${activeCategory === link.id ? 'navbar__item--active' : ''}`}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onCategoryChange(link.id); }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Right actions */}
      <div className="navbar__actions">
        {searchOpen ? (
          <input
            autoFocus
            className="navbar__search-input"
            type="text"
            placeholder="Search titles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onBlur={() => setSearchOpen(false)}
          />
        ) : (
          <button className="navbar__icon-btn" onClick={() => setSearchOpen(true)} title="Search">
            ⌕
          </button>
        )}
        <button className="navbar__hamburger" title="Menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
