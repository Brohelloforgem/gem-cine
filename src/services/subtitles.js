/**
 * Subtitles service using subdl.com
 * Free API key: https://subdl.com/setting (register and grab your key)
 *
 * Endpoint: GET https://api.subdl.com/api/v1/subtitles
 * Params: api_key, tmdb_id, type (movie|tv), language (optional)
 */

const SUBDL_KEY  = import.meta.env.VITE_SUBDL_API_KEY;
const SUBDL_BASE = 'https://api.subdl.com/api/v1/subtitles';
const SUBDL_DL   = 'https://dl.subdl.com';

// ISO 639-1 → readable label map (common languages)
const LANG_LABELS = {
  en: 'English',  es: 'Spanish', fr: 'French',   de: 'German',
  it: 'Italian',  pt: 'Portuguese', ru: 'Russian', ar: 'Arabic',
  ja: 'Japanese', ko: 'Korean',  zh: 'Chinese',   hi: 'Hindi',
  tr: 'Turkish',  nl: 'Dutch',   pl: 'Polish',    sv: 'Swedish',
  fa: 'Persian',  id: 'Indonesian', th: 'Thai',   vi: 'Vietnamese',
};

/**
 * @param {number} tmdbId
 * @param {'movie'|'tv'} type
 * @returns {Promise<{ hasKey: boolean, subtitles: Array }>}
 */
export async function fetchSubtitles(tmdbId, type = 'movie') {
  if (!SUBDL_KEY) {
    return { hasKey: false, subtitles: [] };
  }

  try {
    const params = new URLSearchParams({
      api_key:  SUBDL_KEY,
      tmdb_id:  String(tmdbId),
      type,
    });

    const res  = await fetch(`${SUBDL_BASE}?${params}`);
    const data = await res.json();

    if (!data.subtitles || !Array.isArray(data.subtitles)) {
      return { hasKey: true, subtitles: [] };
    }

    // Group by language, pick best (highest dl count or first)
    const byLang = {};
    for (const sub of data.subtitles) {
      const lang = sub.lang || sub.language || 'unknown';
      if (!byLang[lang]) {
        byLang[lang] = {
          lang,
          label:       LANG_LABELS[lang] || lang.toUpperCase(),
          releaseName: sub.release_name || sub.name || '',
          downloadUrl: sub.url ? `${SUBDL_DL}${sub.url}` : null,
          fullName:    sub.full_name || '',
          count:       1,
        };
      } else {
        byLang[lang].count += 1;
      }
    }

    // Sort: English first, then alphabetical
    const sorted = Object.values(byLang).sort((a, b) => {
      if (a.lang === 'en') return -1;
      if (b.lang === 'en') return 1;
      return a.label.localeCompare(b.label);
    });

    return { hasKey: true, subtitles: sorted };
  } catch (err) {
    console.error('fetchSubtitles failed', err);
    return { hasKey: true, subtitles: [], error: true };
  }
}
