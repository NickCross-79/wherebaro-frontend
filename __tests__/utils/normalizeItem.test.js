import { normalizeItem } from '../../utils/normalizeItem';

// Mock the constants module
jest.mock('../../constants/items', () => ({
  WARFRAME_IMAGE_BASE: 'https://wiki.warframe.com/images',
  PLACEHOLDER_IMAGE: 'https://via.placeholder.com/150',
  PRIMED_DISAPPOINTMENT_IMAGE: 'https://i.imgur.com/ZYakUku.png',
}));

describe('normalizeItem', () => {
  const baseItem = {
    _id: 'abc123',
    name: 'Primed Flow',
    wikiImageLink: '/some/image.png',
    cdnImageLink: 'https://cdn.warframestat.us/img/primed-flow.png',
    link: '/wiki/Primed_Flow',
    creditPrice: 100000,
    ducatPrice: 350,
    type: 'Primed Mod',
    offeringDates: ['2024-01-15', '2024-06-20'],
    uniqueName: '/Lotus/StoreItems/Types/Mods/PrimedFlow',
    likes: ['user1', 'user2'],
    reviews: [{ content: 'Great!' }],
  };

  it('normalizes a full item with all fields', () => {
    const result = normalizeItem(baseItem);
    expect(result.id).toBe('abc123');
    expect(result._id).toBe('abc123');
    expect(result.name).toBe('Primed Flow');
    expect(result.wikiImageLink).toBe('https://wiki.warframe.com/images/some/image.png');
    expect(result.cdnImageLink).toBe('https://cdn.warframestat.us/img/primed-flow.png');
    expect(result.creditPrice).toBe(100000);
    expect(result.ducatPrice).toBe(350);
    expect(result.type).toBe('Primed Mod');
    expect(result.likes).toBe(2); // Array is converted to length
    expect(result.reviews).toHaveLength(1);
    expect(result.uniqueName).toBe('/Lotus/StoreItems/Types/Mods/PrimedFlow');
  });

  it('uses placeholder when wikiImageLink is null/undefined', () => {
    const result = normalizeItem({ ...baseItem, wikiImageLink: null });
    expect(result.wikiImageLink).toBe('https://via.placeholder.com/150');
  });

  it('preserves full URLs in wikiImageLink field', () => {
    const fullUrl = 'https://wiki.warframe.com/images/primed-flow.png';
    const result = normalizeItem({ ...baseItem, wikiImageLink: fullUrl });
    expect(result.wikiImageLink).toBe(fullUrl);
  });

  it('handles numeric likes (already a count)', () => {
    const result = normalizeItem({ ...baseItem, likes: 42 });
    expect(result.likes).toBe(42);
  });

  it('handles missing likes', () => {
    const result = normalizeItem({ ...baseItem, likes: undefined });
    expect(result.likes).toBe(0);
  });

  it('handles null/undefined item gracefully', () => {
    const result = normalizeItem(null);
    expect(result.name).toBeUndefined();
    expect(result.likes).toBe(0);
    expect(result.reviews).toEqual([]);
    expect(result.offeringDates).toEqual([]);
  });

  it('includes dateAdded when option is set', () => {
    const result = normalizeItem(baseItem, { includeDateAdded: true });
    expect(result.dateAdded).toBeInstanceOf(Date);
    expect(result.dateAdded.toISOString()).toContain('2024-06-20');
  });

  it('excludes dateAdded by default', () => {
    const result = normalizeItem(baseItem);
    expect(result.dateAdded).toBeUndefined();
  });

  it('sets dateAdded to null when no offering dates', () => {
    const result = normalizeItem({ ...baseItem, offeringDates: [] }, { includeDateAdded: true });
    expect(result.dateAdded).toBeNull();
  });

  it('strips leading slashes from wikiImageLink paths', () => {
    const result = normalizeItem({ ...baseItem, wikiImageLink: '///leading/slashes.png' });
    expect(result.wikiImageLink).toBe('https://wiki.warframe.com/images/leading/slashes.png');
  });

  it('uses id if _id not present', () => {
    const result = normalizeItem({ ...baseItem, _id: undefined, id: 'fallback-id' });
    expect(result.id).toBe('fallback-id');
    expect(result._id).toBe('fallback-id');
  });
});
