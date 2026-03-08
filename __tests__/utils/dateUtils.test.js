import { formatDate, getRelativeTime, parseLocation } from '../../utils/dateUtils';

describe('formatDate', () => {
  it('returns "Unknown" for null/undefined', () => {
    expect(formatDate(null)).toBe('Unknown');
    expect(formatDate(undefined)).toBe('Unknown');
    expect(formatDate('')).toBe('Unknown');
  });

  it('formats a valid ISO date string', () => {
    // Use a full ISO string with time to avoid timezone offset issues
    const result = formatDate('2025-03-15T12:00:00');
    expect(result).toContain('March');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('formats a full ISO datetime string', () => {
    const result = formatDate('2024-12-25T00:00:00Z');
    expect(result).toContain('December');
    expect(result).toContain('2024');
  });
});

describe('getRelativeTime', () => {
  // getRelativeTime uses YYYY-MM-DD and compares at midnight local time,
  // so build date strings in local time to avoid UTC offset mismatches.
  const localDateStr = (daysAgo) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - daysAgo);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  it('returns "Unknown" for null/undefined', () => {
    expect(getRelativeTime(null)).toBe('Unknown');
    expect(getRelativeTime(undefined)).toBe('Unknown');
    expect(getRelativeTime('')).toBe('Unknown');
  });

  it('returns "Today" for today\'s date', () => {
    expect(getRelativeTime(localDateStr(0))).toBe('Today');
  });

  it('returns "Yesterday" for yesterday', () => {
    expect(getRelativeTime(localDateStr(1))).toBe('Yesterday');
  });

  it('returns "X days ago" for 2-6 days', () => {
    expect(getRelativeTime(localDateStr(3))).toBe('3 days ago');
  });

  it('returns "X week(s) ago" for 7-29 days', () => {
    expect(getRelativeTime(localDateStr(14))).toBe('2 weeks ago');
  });

  it('returns "1 week ago" (singular) for 7 days', () => {
    expect(getRelativeTime(localDateStr(7))).toBe('1 week ago');
  });

  it('returns "X month(s) ago" for 30-364 days', () => {
    expect(getRelativeTime(localDateStr(90))).toBe('3 months ago');
  });

  it('returns "X year(s) ago" for 365+ days', () => {
    expect(getRelativeTime(localDateStr(730))).toBe('2 years ago');
  });
});

describe('parseLocation', () => {
  it('returns null for null/undefined/empty', () => {
    expect(parseLocation(null)).toBeNull();
    expect(parseLocation(undefined)).toBeNull();
    expect(parseLocation('')).toBeNull();
    expect(parseLocation('   ')).toBeNull();
  });

  it('parses parentheses format "Name (Planet)"', () => {
    const result = parseLocation('Larunda Relay (Mercury)');
    expect(result).toEqual({ name: 'Larunda Relay', planet: 'Mercury' });
  });

  it('parses comma format "Name, Planet"', () => {
    const result = parseLocation('Strata Relay, Earth');
    expect(result).toEqual({ name: 'Strata Relay', planet: 'Earth' });
  });

  it('returns just name when no separator found', () => {
    const result = parseLocation('Unknown Relay');
    expect(result).toEqual({ name: 'Unknown Relay', planet: '' });
  });

  it('handles extra whitespace', () => {
    const result = parseLocation('  Larunda Relay  ( Mercury ) ');
    expect(result).toEqual({ name: 'Larunda Relay', planet: 'Mercury' });
  });
});
