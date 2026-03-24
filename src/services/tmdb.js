const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://tmdb-proxy.vercel.app/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const IMG_W300  = 'https://image.tmdb.org/t/p/w300';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

export async function fetchTrending() {
  try {
    const res = await fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results.map(formatMediaData);
  } catch (error) {
    console.error("Failed to fetch trending", error);
    return [];
  }
}

export async function fetchMoviesByGenre(genre) {
  try {
    const genreMapping = { action: 28, comedy: 35, horror: 27 };
    const genreId = genreMapping[genre.toLowerCase()] || 28;
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`);
    const data = await res.json();
    return data.results.map(item => formatMediaData({ ...item, media_type: 'movie' }));
  } catch (error) {
    console.error("Failed to fetch movies by genre", error);
    return [];
  }
}

export async function fetchTvShows() {
  try {
    const res = await fetch(`${BASE_URL}/trending/tv/day?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results.map(item => formatMediaData({ ...item, media_type: 'tv' }));
  } catch (error) {
    console.error("Failed to fetch tv shows", error);
    return [];
  }
}

export async function fetchVideos(id, type) {
  try {
    const res = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch videos", error);
    return [];
  }
}

export async function fetchMovieDetails(id, type = 'movie') {
  try {
    const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
    const data = await res.json();
    return formatMediaData(data);
  } catch (error) {
    console.error("Failed to fetch details", error);
    return null;
  }
}

/** Fetches credits, images, and similar in parallel */
export async function fetchDetailsFull(id, type = 'movie') {
  try {
    const [detailsRes, creditsRes, imagesRes, similarRes, videosRes] = await Promise.all([
      fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/${type}/${id}/images?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`),
    ]);

    const [details, credits, images, similar, videos] = await Promise.all([
      detailsRes.json(), creditsRes.json(), imagesRes.json(),
      similarRes.json(), videosRes.json()
    ]);

    const cast = (credits.cast || []).slice(0, 8).map(p => ({
      id: p.id,
      name: p.name,
      character: p.character,
      avatar: p.profile_path ? `${IMG_W300}${p.profile_path}` : null,
    }));

    const director = (credits.crew || []).find(c => c.job === 'Director');

    const stills = (images.backdrops || []).slice(0, 8).map(img => ({
      url: `https://image.tmdb.org/t/p/w780${img.file_path}`
    }));

    const similarItems = (similar.results || []).slice(0, 10).map(item =>
      formatMediaData({ ...item, media_type: type })
    );

    const trailer = (videos.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube');

    // Auto-detect type if it's potentially wrong
    let actualType = type;
    if (type === 'movie' && (details.name || details.number_of_seasons || details.first_air_date)) {
      actualType = 'tv';
    } else if (type === 'tv' && (details.title || details.release_date) && !details.name) {
      actualType = 'movie';
    }

    // TV episodes from season 1
    let seasons = [];
    let episodes = [];
    if (actualType === 'tv') {
      seasons = (details.seasons || []).filter(s => s.season_number > 0);
      try {
        const epRes = await fetch(`${BASE_URL}/tv/${id}/season/1?api_key=${API_KEY}`);
        const epData = await epRes.json();
        episodes = (epData.episodes || []).map(ep => ({
          id: ep.id,
          number: ep.episode_number,
          title: ep.name,
          duration: ep.runtime ? `${ep.runtime}m` : '—',
          still: ep.still_path ? `${IMG_W300}${ep.still_path}` : null,
          overview: ep.overview,
        }));
      } catch {}
    }

    const runtime = details.runtime || (details.episode_run_time && details.episode_run_time[0]) || null;
    const genres = (details.genres || []).map(g => g.name);
    const originalLanguage = details.original_language?.toUpperCase?.() || '—';
    const tagline = details.tagline || '';

    return {
      ...formatMediaData({ ...details, media_type: actualType }),
      tagline, genres, runtime, originalLanguage,
      director: director?.name || null,
      cast, stills, similarItems, trailer: trailer?.key || null,
      episodes,
      seasons,
    };
  } catch (error) {
    console.error("fetchDetailsFull failed", error);
    return null;
  }
}

export async function fetchSeasonEpisodes(tvId, seasonNumber) {
  try {
    const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
    const data = await res.json();
    return (data.episodes || []).map(ep => ({
      id: ep.id,
      number: ep.episode_number,
      title: ep.name,
      duration: ep.runtime ? `${ep.runtime}m` : '—',
      still: ep.still_path ? `${IMG_W300}${ep.still_path}` : null,
      overview: ep.overview,
    }));
  } catch (error) {
    console.error("Failed to fetch season episodes", error);
    return [];
  }
}

export async function searchMedia(query) {
  if (!query) return [];
  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .map(item => formatMediaData(item));
  } catch (error) {
    console.error("Search failed", error);
    return [];
  }
}

function formatMediaData(item) {
  return {
    id: item.id,
    title: item.title || item.name || item.original_title || item.original_name,
    poster: item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image',
    background: item.backdrop_path ? `${BACKDROP_BASE}${item.backdrop_path}` : 'https://via.placeholder.com/1280x720?text=No+Background',
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 0,
    mediaType: item.media_type || (item.name || item.first_air_date ? 'tv' : 'movie'),
    releaseDate: item.release_date || item.first_air_date,
    overview: item.overview
  };
}
