import { toSlug } from '../../utils/slugify';

describe('toSlug', () => {
  it('converts basic names to lowercase underscored slugs', () => {
    expect(toSlug('Primed Flow')).toBe('primed_flow');
    expect(toSlug('Prisma Grinlok')).toBe('prisma_grinlok');
  });

  it('replaces "orokin" with "corrupted"', () => {
    expect(toSlug('Orokin Catalyst')).toBe('corrupted_catalyst');
    expect(toSlug('Orokin Reactor')).toBe('corrupted_reactor');
  });

  it('treats apostrophes as non-alphanumeric (replaced with underscore)', () => {
    // Both straight and curly apostrophes become _ via the non-alphanum rule
    expect(toSlug("Ki'Teer Syandana")).toBe('ki_teer_syandana');
    expect(toSlug("Ki\u2019Teer Sekhara")).toBe('ki_teer_sekhara');
  });

  it('replaces non-alphanumeric characters with underscores', () => {
    expect(toSlug('Primed Point Blank')).toBe('primed_point_blank');
    expect(toSlug('Sands of Inaros')).toBe('sands_of_inaros');
  });

  it('collapses multiple underscores', () => {
    expect(toSlug('Primed   Flow')).toBe('primed_flow');
  });

  it('trims leading/trailing underscores', () => {
    expect(toSlug(' Primed Flow ')).toBe('primed_flow');
    expect(toSlug('--Primed Flow--')).toBe('primed_flow');
  });

  it('handles empty string', () => {
    expect(toSlug('')).toBe('');
  });

  it('converts null/undefined to their string representation', () => {
    // String(null) => 'null', String(undefined) => 'undefined'
    expect(toSlug(null)).toBe('null');
    expect(toSlug(undefined)).toBe('undefined');
  });
});
