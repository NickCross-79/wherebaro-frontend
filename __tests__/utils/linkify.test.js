import { linkify, isSafeUrl } from '../../utils/linkify';

describe('linkify', () => {
  it('returns a single text part for plain text', () => {
    expect(linkify('This item is great!')).toEqual([
      { type: 'text', text: 'This item is great!' },
    ]);
  });

  it('returns [] for empty or non-string input', () => {
    expect(linkify('')).toEqual([]);
    expect(linkify(null)).toEqual([]);
    expect(linkify(undefined)).toEqual([]);
    expect(linkify(42)).toEqual([]);
  });

  it('splits text around an https URL', () => {
    expect(linkify('Check https://example.com/page for info')).toEqual([
      { type: 'text', text: 'Check ' },
      { type: 'link', text: 'https://example.com/page', url: 'https://example.com/page' },
      { type: 'text', text: ' for info' },
    ]);
  });

  it('preserves an explicit http scheme', () => {
    const parts = linkify('see http://example.com');
    expect(parts[1]).toEqual({
      type: 'link',
      text: 'http://example.com',
      url: 'http://example.com',
    });
  });

  it('prefixes https:// for www domains', () => {
    const parts = linkify('see www.example.com');
    expect(parts[1]).toEqual({
      type: 'link',
      text: 'www.example.com',
      url: 'https://www.example.com',
    });
  });

  it('links bare domains with known TLDs', () => {
    const parts = linkify('try warframe.market for prices');
    expect(parts).toEqual([
      { type: 'text', text: 'try ' },
      { type: 'link', text: 'warframe.market', url: 'https://warframe.market' },
      { type: 'text', text: ' for prices' },
    ]);
  });

  it('does not link word.word with an unknown TLD', () => {
    expect(linkify('random.word here')).toEqual([
      { type: 'text', text: 'random.word here' },
    ]);
  });

  it('strips trailing punctuation from links', () => {
    expect(linkify('check example.com.')).toEqual([
      { type: 'text', text: 'check ' },
      { type: 'link', text: 'example.com', url: 'https://example.com' },
      { type: 'text', text: '.' },
    ]);
    const excl = linkify('wow https://example.com!');
    expect(excl[1].text).toBe('https://example.com');
    expect(excl[2].text).toBe('!');
  });

  it('strips a closing paren when the URL has no opening paren', () => {
    const parts = linkify('(see example.com)');
    expect(parts).toEqual([
      { type: 'text', text: '(see ' },
      { type: 'link', text: 'example.com', url: 'https://example.com' },
      { type: 'text', text: ')' },
    ]);
  });

  it('keeps a balanced closing paren in the URL path', () => {
    const parts = linkify('read https://en.wikipedia.org/wiki/Foo_(bar) now');
    expect(parts[1].text).toBe('https://en.wikipedia.org/wiki/Foo_(bar)');
  });

  it('does not link email addresses', () => {
    const parts = linkify('mail me at user@example.com please');
    expect(parts.some((p) => p.type === 'link')).toBe(false);
  });

  it('keeps query strings with ampersands in one link', () => {
    const parts = linkify('go to https://example.com/x?a=1&b=2');
    expect(parts[1].text).toBe('https://example.com/x?a=1&b=2');
  });

  it('handles multiple URLs in order', () => {
    const parts = linkify('see example.com and https://foo.org too');
    const links = parts.filter((p) => p.type === 'link');
    expect(links.map((l) => l.url)).toEqual(['https://example.com', 'https://foo.org']);
  });
});

describe('isSafeUrl', () => {
  it('accepts http and https', () => {
    expect(isSafeUrl('https://example.com')).toBe(true);
    expect(isSafeUrl('http://example.com')).toBe(true);
  });

  it('rejects other schemes and non-strings', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('file:///etc/passwd')).toBe(false);
    expect(isSafeUrl(null)).toBe(false);
  });
});
