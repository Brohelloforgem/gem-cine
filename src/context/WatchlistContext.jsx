import { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('gemcine_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gemcine_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (item) => {
    if (!item || !item.id) return;
    setWatchlist((prev) => {
      const isExist = prev.find((i) => i.id === item.id);
      if (isExist) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [item, ...prev];
      }
    });
  };

  const isInWatchlist = (id) => {
    return !!watchlist.find((i) => i.id === id);
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, toggleWatchlist, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlistContext() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlistContext must be used within a WatchlistProvider');
  }
  return context;
}
