import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MediaCarousel from './components/MediaCarousel';
import MediaGrid from './components/MediaGrid';
import PlayerModal from './components/PlayerModal';
import EditorialModal from './components/EditorialModal';
import BottomStrip from './components/BottomStrip';
import { LeftSidebar, RightSidebar } from './components/Sidebars';
import { fetchTrending, fetchMoviesByGenre, fetchTvShows, searchMedia } from './services/tmdb';
import { useWatchlist } from './hooks/useWatchlist';
import './App.css';

function App() {
  const [trending, setTrending] = useState([]);
  const [action, setAction] = useState([]);
  const [comedy, setComedy] = useState([]);
  const [horror, setHorror] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [activeSection, setActiveSection] = useState(0);

  const [activeCategory, setActiveCategory] = useState('home');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  const { watchlist } = useWatchlist();

  useEffect(() => {
    async function loadData() {
      const trendingData = await fetchTrending();
      const actionData   = await fetchMoviesByGenre('action');
      const comedyData   = await fetchMoviesByGenre('comedy');
      const horrorData   = await fetchMoviesByGenre('horror');
      const tvData       = await fetchTvShows();

      setTrending(trendingData);
      setAction(actionData);
      setComedy(comedyData);
      setHorror(horrorData);
      setTvShows(tvData);

      if (trendingData?.length > 0) setFeatured(trendingData[0]);
    }
    loadData();
  }, []);

  const handlePlay = (movie) => setSelectedMovie(movie);
  const closePlayer = () => setSelectedMovie(null);

  const handleSearch = async (query) => {
    if (!query.trim()) { setIsSearching(false); setSearchResults(null); return; }
    setIsSearching(true);
    setActiveCategory('');
    const results = await searchMedia(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSearchResults(null);
    setIsSearching(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHome = activeCategory === 'home' && searchResults === null;

  const renderContent = () => {
    if (searchResults !== null) {
      return <div className="page-content"><MediaGrid title={isSearching ? 'Searching…' : 'Search Results'} items={searchResults} onPlay={handlePlay} /></div>;
    }
    if (activeCategory === 'tv') {
      return <div className="page-content"><MediaGrid title="TV Shows" items={tvShows} onPlay={handlePlay} /></div>;
    }
    if (activeCategory === 'movie') {
      // Remove duplicates when merging genre arrays using a single-pass filter
      const allMovies = [...action, ...comedy, ...horror];
      const seen = new Set();
      const movieItems = allMovies.filter(m => {
        if (!m.id || seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
      return <div className="page-content"><MediaGrid title="Movies" items={movieItems} onPlay={handlePlay} /></div>;
    }
    if (activeCategory === 'popular') {
      return <div className="page-content"><MediaGrid title="New & Popular" items={trending} onPlay={handlePlay} /></div>;
    }
    if (activeCategory === 'watchlist') {
      return <div className="page-content"><MediaGrid title="My List" items={watchlist} onPlay={handlePlay} /></div>;
    }

    // HOME
    return (
      <>
        <Hero movie={featured} onPlay={handlePlay} />
        <div className="carousels-section">
          <MediaCarousel title="Trending Now"      items={trending} onPlay={handlePlay} />
          <MediaCarousel title="TV Shows"          items={tvShows}  onPlay={handlePlay} />
          <MediaCarousel title="Action Packed"     items={action}   onPlay={handlePlay} />
          <MediaCarousel title="Comedies"          items={comedy}   onPlay={handlePlay} />
          <MediaCarousel title="Horror & Thrillers" items={horror}  onPlay={handlePlay} />
        </div>
      </>
    );
  };

  return (
    <div className="app-container">
      <Navbar
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        activeCategory={activeCategory}
      />

      {/* Editorial sidebars */}
      <LeftSidebar activeSection={activeSection} onDotClick={setActiveSection} />
      <RightSidebar onFeatureClick={setActiveFeature} />

      <main className="app-main">
        {renderContent()}
      </main>

      {/* Bottom strip only on home */}
      {isHome && trending.length > 0 && (
        <BottomStrip items={trending} onPlay={handlePlay} />
      )}

      {selectedMovie && (
        <PlayerModal movie={selectedMovie} onClose={closePlayer} />
      )}

      {activeFeature && (
        <EditorialModal title={activeFeature} onClose={() => setActiveFeature(null)} />
      )}
    </div>
  );
}

export default App;
