/**
 * Split review text into plain-text and link parts so URLs can be
 * rendered as tappable segments.
 */

// Bare domains (no scheme, no www.) are only linked for these TLDs to
// avoid false positives on typos like "great.Buy it" or "item.name".
const TLDS = 'com|net|org|io|gg|app|dev|co|me|tv|info|xyz|wiki|market';

const URL_REGEX = new RegExp(
  'https?:\\/\\/[^\\s<>"\']+' +
  '|www\\.[^\\s<>"\']+' +
  `|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:${TLDS})\\b(?:\\/[^\\s<>"\']*)?`,
  'gi'
);

const TRAILING_PUNCTUATION = /[.,!?;:'"’”…]+$/;

/** True if url is safe to open externally (http/https only). */
export function isSafeUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

function stripTrailing(match) {
  let text = match;
  let stripped = '';
  for (;;) {
    const punct = text.match(TRAILING_PUNCTUATION);
    if (punct) {
      stripped = punct[0] + stripped;
      text = text.slice(0, -punct[0].length);
      continue;
    }
    // Strip a closing paren only when the URL has no opening paren,
    // so "(see example.com)" loses the ")" but ".../Foo_(bar)" keeps it.
    if (text.endsWith(')') && !text.includes('(')) {
      stripped = ')' + stripped;
      text = text.slice(0, -1);
      continue;
    }
    return { text, stripped };
  }
}

function looksLikeEmailFragment(text, start, end) {
  const before = start > 0 ? text[start - 1] : '';
  const after = end < text.length ? text[end] : '';
  return /[@a-z0-9.-]/i.test(before) || after === '@';
}

/**
 * Split text into parts for rendering.
 * @param {string} text
 * @returns {Array<{type: 'text'|'link', text: string, url?: string}>}
 *   'link' parts carry a url that always starts with http:// or https://.
 *   Returns [] for empty or non-string input.
 */
export function linkify(text) {
  if (!text || typeof text !== 'string') return [];

  const parts = [];
  let lastIndex = 0;
  URL_REGEX.lastIndex = 0;

  let match;
  while ((match = URL_REGEX.exec(text)) !== null) {
    const raw = match[0];
    const start = match.index;
    const hasScheme = /^https?:\/\//i.test(raw);

    if (!hasScheme && looksLikeEmailFragment(text, start, start + raw.length)) {
      continue;
    }

    const { text: linkText, stripped } = stripTrailing(raw);
    if (!linkText) continue;

    if (start > lastIndex) {
      parts.push({ type: 'text', text: text.slice(lastIndex, start) });
    }
    parts.push({
      type: 'link',
      text: linkText,
      url: hasScheme ? linkText : `https://${linkText}`,
    });
    lastIndex = start + raw.length - stripped.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', text: text.slice(lastIndex) });
  }
  return parts;
}
