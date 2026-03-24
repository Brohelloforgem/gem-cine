import { useEffect, useState, useRef } from 'react';
import './PlayerModal.css';
import { fetchDetailsFull, fetchSeasonEpisodes } from '../services/tmdb';
import { fetchSubtitles } from '../services/subtitles';
import { useWatchlist } from '../hooks/useWatchlist';


const TABS = ['EPISODES', 'MEDIA', 'CAPTIONS', 'SIMILAR'];

function StarRating({ score }) {
  const filled = Math.round((score / 10) * 5);
  return (
    <span className="pm-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= filled ? 'pm-star--on' : 'pm-star--off'}>★</span>
      ))}
    </span>
  );
}

function FilmPerfs() {
  return (
    <div className="pm-perfs" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => <div key={i} className="pm-perf" />)}
    </div>
  );
}

export default function PlayerModal({ movie: initialMovie, onClose }) {
  const [details, setDetails]         = useState(null);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [activeEp, setActiveEp]       = useState(0);
  const [selectedSeason, setSeason]   = useState(1);
  const [episodes, setEpisodes]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [epLoading, setEpLoading]     = useState(false);
  const [subtitles, setSubtitles]     = useState(null); // null = not yet fetched
  const [subLoading, setSubLoading]   = useState(false);

  // New states for Fix 2 & 3
  const [isHQ, setIsHQ]               = useState(false);
  const [isHdrActive, setHdrActive]   = useState(false);
  const [isDolbyActive, setDolbyActive] = useState(false);
  const [captionSize, setCaptionSize] = useState(16);
  const [selectedLang, setLang]       = useState('en');
  const [isCcOn, setIsCcOn]           = useState(true);
  const [tooltip, setTooltip]         = useState('');

  const iframeRef = useRef(null);


  const movie = details || initialMovie;
  const isTv  = movie?.mediaType === 'tv';

  // Build tab list based on content type
  const TABS = isTv
    ? ['EPISODES', 'MEDIA', 'CAPTIONS', 'SIMILAR']
    : ['SYNOPSIS', 'MEDIA', 'CAPTIONS', 'SIMILAR'];

  const [activeTab, setActiveTab] = useState(isTv ? 'EPISODES' : 'SYNOPSIS');
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const scrollRef = useRef(null);

  // Reset default tab whenever media type changes
  useEffect(() => {
    setActiveTab(isTv ? 'EPISODES' : 'SYNOPSIS');
  }, [isTv]);

  // Lazy-load subtitles only when CAPTIONS tab is opened
  useEffect(() => {
    if (activeTab !== 'CAPTIONS' || subtitles !== null) return;
    setSubLoading(true);
    fetchSubtitles(initialMovie.id, initialMovie.mediaType).then(result => {
      setSubtitles(result);
      setSubLoading(false);
    });
  }, [activeTab, subtitles, initialMovie.id, initialMovie.mediaType]);


  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setLoading(true);
    fetchDetailsFull(initialMovie.id, initialMovie.mediaType).then(d => {
      if (d) {
        setDetails(d);
        if (d.episodes) setEpisodes(d.episodes);
      }
      setLoading(false);
    });
    return () => { document.body.style.overflow = ''; };
  }, [initialMovie.id, initialMovie.mediaType]);

  // Fetch episodes when season changes
  useEffect(() => {
    if (selectedSeason === 1 && details?.episodes) return; // Already have season 1
    if (!isTv) return;

    setEpLoading(true);
    fetchSeasonEpisodes(initialMovie.id, selectedSeason).then(eps => {
      setEpisodes(eps);
      setEpLoading(false);
      setActiveEp(0);
    });
  }, [selectedSeason, isTv, initialMovie.id, details?.episodes]);

  if (!movie) return null;

  const scorePercent = Math.round((movie.rating / 10) * 100);
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';
  const currentEpNum = episodes[activeEp]?.number || 1;

  // Build Player URL with options
  const getPlayerUrl = () => {
    let baseUrl = movie.mediaType === 'tv' 
      ? `https://vidking.org/embed/tv?tmdb=${movie.id}&season=${selectedSeason}&e=${currentEpNum}`
      : `https://vidking.org/embed/movie?tmdb=${movie.id}`;

    const url = new URL(baseUrl);
    
    // Some basic params to keep embed clean
    url.searchParams.set('autoplay', '1');
    if (isCcOn) {
      url.searchParams.set('ds_langs', selectedLang);
    }
    
    return url.toString();
  };

  const playerUrl = getPlayerUrl();

  // Handle caption size postMessage
  useEffect(() => {
    if (iframeRef.current && isPlaying) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'subtitleSize', size: captionSize },
        '*'
      );
    }
  }, [captionSize, isPlaying]);


  return (
    <div className="pm-overlay" role="dialog" aria-modal="true">
      {/* Click-outside close */}
      <div className="pm-bg" onClick={onClose} />

      <div className="pm-sheet">
        {/* ── HERO ─────────────────────────────────── */}
        <section className="pm-hero">
          <div className="pm-hero__bg" style={{ backgroundImage: `url(${movie.background})` }} />
          <div className="pm-hero__overlay" />
          <FilmPerfs />

          <button className="pm-close" onClick={onClose} title="Close">✕</button>

          <div className="pm-hero__content">
            <p className="pm-hero__eyebrow">
              {isTv ? 'Series' : 'Feature Film'}&ensp;·&ensp;{year}
            </p>
            <h1 className="pm-hero__title">
              {(movie.title || '').toUpperCase()}
            </h1>
            {details?.tagline && (
              <p className="pm-hero__tagline">"{details.tagline}"</p>
            )}

            {/* Score */}
            <div className="pm-hero__score">
              <StarRating score={movie.rating} />
              <span className="pm-hero__pct">{scorePercent}%</span>
            </div>

            {/* Badges */}
            <div className="pm-hero__badges">
              {details?.genres?.slice(0, 3).map(g => (
                <span key={g} className="pm-badge">{g}</span>
              ))}
              {details?.runtime && (
                <span className="pm-badge">{details.runtime}m</span>
              )}
            </div>

            {/* CTAs */}
            <div className="pm-hero__actions">
              <button
                className="btn-play pm-play-btn"
                onClick={() => setIsPlaying(true)}
              >
                <span>▶</span> PLAY NOW
              </button>
              <button
                className={`pm-list-btn ${isInWatchlist(movie.id) ? 'pm-list-btn--added' : ''}`}
                onClick={() => toggleWatchlist(movie)}
              >
                {isInWatchlist(movie.id) ? '✓ IN LIST' : '+ MY LIST'}
              </button>
            </div>
          </div>
        </section>

        {/* ── TAB BAR ──────────────────────────────── */}
        <nav className="pm-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`pm-tab ${activeTab === t ? 'pm-tab--active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* ── BODY ─────────────────────────────────── */}
        <div className="pm-body" ref={scrollRef}>
          {/* LEFT */}
          <div className="pm-left">

            {/* ─ Player ─ */}
            <div className="pm-player">
              {isPlaying ? (
                <>
                  <div className="pm-player-container">
                    <div className="pm-player-wrapper">
                      <iframe
                        key={playerUrl}
                        ref={iframeRef}
                        src={playerUrl}
                        className="pm-iframe"
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                        sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock"
                        title={movie.title}
                      />
                    </div>
                    
                    {/* Caption Control Bar */}
                    <div className="pm-caption-bar">
                      <div className="pm-cb-left">
                        <button 
                          className={`pm-cb-btn ${isCcOn ? 'pm-cb-btn--active' : ''}`}
                          onClick={() => setIsCcOn(!isCcOn)}
                        >
                          CC
                        </button>
                        <div className="pm-cb-size">
                          <button onClick={() => setCaptionSize(prev => Math.max(10, prev - 2))}>A-</button>
                          <span className="pm-cb-size-val">{captionSize}</span>
                          <button onClick={() => setCaptionSize(prev => Math.min(28, prev + 2))}>A+</button>
                        </div>
                      </div>
                      <div className="pm-cb-right">
                        <select 
                          className="pm-cb-lang" 
                          value={selectedLang}
                          onChange={(e) => {
                            setLang(e.target.value);
                            setIsCcOn(true);
                          }}
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="fr">French</option>
                          <option value="es">Spanish</option>
                          <option value="ar">Arabic</option>
                        </select>
                      </div>
                    </div>
                  </div>


                </>
              ) : (
                <div className="pm-player__thumb">
                  <img src={movie.background} alt={movie.title} />
                  <button className="pm-player__play-circle" onClick={() => setIsPlaying(true)}>
                    <span>▶</span>
                  </button>
                </div>
              )}
            </div>

            {/* ─ Tab content router ─ */}
            {activeTab === 'SYNOPSIS' && (
              <div className="pm-overview">
                <h3 className="pm-section-title">Synopsis</h3>
                <p className="pm-overview__text">{movie.overview}</p>
                
                {!isTv && details?.runtime && (
                  <div className="pm-watch-now">
                    <h3 className="pm-section-title">Watch Now</h3>
                    <div className="pm-watch-card">
                      <div className="pm-watch-card__info">
                        <span className="pm-watch-card__type">Feature Film</span>
                        <span className="pm-watch-card__runtime">{details.runtime} Minutes</span>
                      </div>
                      <button className="pm-watch-card__btn" onClick={() => setIsPlaying(true)}>
                        BEGIN FEATURE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'EPISODES' && isTv && (
              <div className="pm-episodes">
                <div className="pm-episodes__header">
                  <h3 className="pm-section-title">Episodes</h3>
                  {details?.seasons?.length > 0 && (
                    <select 
                      className="pm-season-select"
                      value={selectedSeason}
                      onChange={(e) => setSeason(Number(e.target.value))}
                    >
                      {details.seasons.map(s => (
                        <option key={s.id} value={s.season_number}>
                          {s.name || `Season ${s.season_number}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {epLoading ? (
                  <p className="pm-loading">Loading episodes…</p>
                ) : episodes?.length > 0 ? (
                  <div className="pm-ep-list">
                    {episodes.map((ep, i) => (
                      <div
                        key={ep.id}
                        className={`pm-ep-card ${activeEp === i ? 'pm-ep-card--active' : ''}`}
                        onClick={() => {
                          setActiveEp(i);
                          setIsPlaying(true);
                        }}
                      >
                        <div className="pm-ep-card__thumb">
                          <img src={ep.still || movie.background} alt={ep.title} />
                          <div className="pm-ep-card__number">E{ep.number.toString().padStart(2, '0')}</div>
                        </div>
                        <div className="pm-ep-card__content">
                          <div className="pm-ep-card__header">
                            <h4 className="pm-ep-card__title">{ep.title}</h4>
                            <span className="pm-ep-card__duration">{ep.duration}</span>
                          </div>
                          <p className="pm-ep-card__overview">{ep.overview}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="pm-loading">No episode data available.</p>
                )}
              </div>
            )}

            {activeTab === 'MEDIA' && (
              <div className="pm-media">
                <h3 className="pm-section-title">Media · Stills &amp; Trailers</h3>
                {loading ? (
                  <p className="pm-loading">Loading stills…</p>
                ) : details?.stills?.length > 0 ? (
                  <div className="pm-stills">
                    {details.stills.map((s, i) => (
                      <div key={i} className="pm-still">
                        <img
                          src={s.url || 'https://via.placeholder.com/1280x720?text=No+Still'}
                          alt={`Still ${i + 1}`}
                          loading="lazy"
                        />
                        <div className="pm-still__hover">▶</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="pm-loading">No stills available for this title.</p>
                )}
              </div>
            )}

            {activeTab === 'SIMILAR' && (
              <div className="pm-similar">
                <h3 className="pm-section-title">Similar Titles</h3>
                {loading ? (
                  <p className="pm-loading">Loading similar titles…</p>
                ) : details?.similarItems?.length > 0 ? (
                  <div className="pm-similar__grid">
                    {details.similarItems.map(item => (
                      <div key={item.id} className="pm-sim-card">
                        <img
                          src={item.poster || 'https://via.placeholder.com/500x750?text=No+Poster'}
                          alt={item.title}
                          loading="lazy"
                        />
                        <p>{item.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="pm-loading">No similar titles found.</p>
                )}
              </div>
            )}

            {activeTab === 'CAPTIONS' && (
              <div className="pm-captions">
                <h3 className="pm-section-title">Available Subtitles</h3>

                {subLoading && <p className="pm-loading">Searching subtitle database…</p>}

                {!subLoading && subtitles && !subtitles.hasKey && (
                  <div className="pm-sub-nokey">
                    <span className="pm-sub-nokey__icon">💬</span>
                    <p className="pm-sub-nokey__title">Subtitle API key not configured</p>
                    <p className="pm-sub-nokey__desc">
                      Add a free key from{' '}
                      <a href="https://subdl.com/setting" target="_blank" rel="noreferrer">subdl.com</a>
                      {' '}to your <code>.env</code> file:
                    </p>
                    <code className="pm-sub-nokey__code">VITE_SUBDL_API_KEY=your_key_here</code>
                  </div>
                )}

                {!subLoading && subtitles?.hasKey && subtitles?.error && (
                  <p className="pm-loading">Could not fetch subtitles. Check your API key or try again.</p>
                )}

                {!subLoading && subtitles?.hasKey && !subtitles?.error && subtitles?.subtitles?.length === 0 && (
                  <p className="pm-loading">No subtitles found for this title.</p>
                )}

                {!subLoading && subtitles?.subtitles?.length > 0 && (
                  <div className="pm-sub-grid">
                    {subtitles.subtitles.map(sub => (
                      <a
                        key={sub.lang}
                        className="pm-sub-card"
                        href={sub.downloadUrl || '#'}
                        download
                        target="_blank"
                        rel="noreferrer"
                        title={sub.releaseName}
                      >
                        <span className="pm-sub-card__lang">{sub.lang.toUpperCase()}</span>
                        <span className="pm-sub-card__label">{sub.label}</span>
                        {sub.count > 1 && (
                          <span className="pm-sub-card__count">{sub.count} tracks</span>
                        )}
                        <span className="pm-sub-card__dl">↓</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}


          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="pm-sidebar">
            {/* Quality */}
            <div className="pm-sb-section">
              <div className="pm-quality-badges">
                <button 
                  className={`pm-qbadge ${isHQ ? 'pm-qbadge--active' : ''}`}
                  onClick={() => setIsHQ(!isHQ)}
                >
                  4K
                </button>
                <button 
                  className={`pm-qbadge ${isHdrActive ? 'pm-qbadge--active' : ''}`}
                  onClick={() => {
                    setHdrActive(!isHdrActive);
                    if (!isHdrActive) {
                      setTooltip('HDR available on supported displays');
                      setTimeout(() => setTooltip(''), 3000);
                    }
                  }}
                >
                  HDR
                </button>
                <button 
                  className={`pm-qbadge pm-qbadge--dolby ${isDolbyActive ? 'pm-qbadge--active' : ''}`}
                  onClick={() => {
                    setDolbyActive(!isDolbyActive);
                    if (!isDolbyActive) {
                      setTooltip('Dolby Atmos on supported devices');
                      setTimeout(() => setTooltip(''), 3000);
                    }
                  }}
                >
                  DOLBY
                </button>
              </div>
              {tooltip && <div className="pm-badge-tooltip">{tooltip}</div>}
            </div>

            {/* Meta */}
            <div className="pm-sb-section">
              {details?.director && (
                <div className="pm-sb-row">
                  <span className="pm-sb-label">Director</span>
                  <span className="pm-sb-value">{details.director}</span>
                </div>
              )}
              <div className="pm-sb-row">
                <span className="pm-sb-label">Language</span>
                <span className="pm-sb-value">{details?.originalLanguage || '—'}</span>
              </div>
              <div className="pm-sb-row">
                <span className="pm-sb-label">Type</span>
                <span className="pm-sb-value">{isTv ? 'TV Series' : 'Feature Film'}</span>
              </div>
            </div>

            {/* Cast */}
            {details?.cast?.length > 0 && (
              <div className="pm-sb-section">
                <h4 className="pm-sb-heading">Cast</h4>
                <ul className="pm-cast">
                  {details.cast.map(actor => (
                    <li key={actor.id} className="pm-cast-item">
                      <div className="pm-cast-avatar">
                        {actor.avatar
                          ? <img src={actor.avatar} alt={actor.name} loading="lazy" />
                          : <span>{actor.name.slice(0, 2).toUpperCase()}</span>
                        }
                      </div>
                      <div className="pm-cast-info">
                        <span className="pm-cast-name">{actor.name}</span>
                        <span className="pm-cast-role">{actor.character}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
