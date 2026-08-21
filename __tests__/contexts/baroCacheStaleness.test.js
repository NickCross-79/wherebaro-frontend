/**
 * Tests for getBaroCacheStaleReason — the rule that decides whether a cached
 * Baro response can be trusted or must be refetched.
 *
 * Regression cover for the visit where the backend arrival job bailed out and
 * the app cached an empty inventory while Baro was active: that cache used to
 * stay "valid" until expiry, stranding users on an empty relay all weekend.
 */
import { getBaroCacheStaleReason } from '../../contexts/InventoryContext';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Friday 13:00 UTC arrival, Sunday 13:00 UTC expiry
const ACTIVATION = '2026-08-21T13:00:00.000Z';
const EXPIRY = '2026-08-23T13:00:00.000Z';
// Friday 14:26 UTC — mid-visit, the moment from the bug report
const MID_VISIT = new Date('2026-08-21T14:26:00.000Z').getTime();

const activeCache = (overrides = {}) => ({
  isActive: true,
  activation: ACTIVATION,
  expiry: EXPIRY,
  location: 'Orcus Relay (Pluto)',
  inventory: [{ uniqueName: '/Lotus/Foo', item: 'Primed Flow', ducats: 300, credits: 175000 }],
  cachedAt: MID_VISIT - HOUR,
  ...overrides,
});

describe('getBaroCacheStaleReason', () => {
  it('trusts a healthy mid-visit cache that has inventory', () => {
    expect(getBaroCacheStaleReason(activeCache(), MID_VISIT)).toBeNull();
  });

  it('reports no-cache when nothing is cached', () => {
    expect(getBaroCacheStaleReason(null, MID_VISIT)).toBe('no-cache');
  });

  it('rejects an empty inventory cached while Baro is active', () => {
    expect(
      getBaroCacheStaleReason(activeCache({ inventory: [] }), MID_VISIT)
    ).toBe('empty-while-active');
  });

  it('rejects a missing inventory field while Baro is active', () => {
    expect(
      getBaroCacheStaleReason(activeCache({ inventory: undefined }), MID_VISIT)
    ).toBe('empty-while-active');
  });

  it('does NOT flag an empty inventory while Baro is away', () => {
    // Baro absent: an empty inventory is the correct, expected state
    const absent = {
      isActive: false,
      activation: '2026-09-04T13:00:00.000Z',
      expiry: '2026-09-06T13:00:00.000Z',
      inventory: [],
      cachedAt: MID_VISIT,
    };
    expect(getBaroCacheStaleReason(absent, MID_VISIT)).toBeNull();
  });

  it('rejects a cache whose expiry has passed', () => {
    const afterDeparture = new Date('2026-08-23T13:00:01.000Z').getTime();
    expect(getBaroCacheStaleReason(activeCache(), afterDeparture)).toBe('dates-passed');
  });

  it('rejects a cache older than two days', () => {
    expect(
      getBaroCacheStaleReason(activeCache({ cachedAt: MID_VISIT - 3 * DAY }), MID_VISIT)
    ).toBe('too-old');
  });

  it('treats a cache with no cachedAt stamp as too old', () => {
    expect(
      getBaroCacheStaleReason(activeCache({ cachedAt: undefined }), MID_VISIT)
    ).toBe('too-old');
  });

  it('prefers dates-passed over empty-while-active when both apply', () => {
    const afterDeparture = new Date('2026-08-23T13:00:01.000Z').getTime();
    expect(
      getBaroCacheStaleReason(activeCache({ inventory: [] }), afterDeparture)
    ).toBe('dates-passed');
  });
});
