import { isBaroActive, fetchBaroData, fetchBaroDataWithFallback, resetSimulation } from '../../services/baroService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const activeBaro = (inventory = []) => {
  const now = new Date();
  return {
    activation: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    expiry: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    location: 'Test Relay',
    inventory,
  };
};

const backendCurrent = (items = []) => ({
  activation: activeBaro().activation,
  expiry: activeBaro().expiry,
  location: 'Backend Relay',
  isActive: true,
  items,
});

// ─── isBaroActive ────────────────────────────────────────────────────────────

describe('isBaroActive', () => {
  it('returns true when now is between activation and expiry', () => {
    const now = new Date();
    const activation = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // 1h ago
    const expiry = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1h from now
    expect(isBaroActive(activation, expiry)).toBe(true);
  });

  it('returns false when now is before activation', () => {
    const now = new Date();
    const activation = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1h from now
    const expiry = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2h from now
    expect(isBaroActive(activation, expiry)).toBe(false);
  });

  it('returns false when now is after expiry', () => {
    const now = new Date();
    const activation = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(); // 2h ago
    const expiry = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // 1h ago
    expect(isBaroActive(activation, expiry)).toBe(false);
  });

  it('returns false when now exactly equals expiry (exclusive end)', () => {
    const now = new Date();
    const activation = new Date(now.getTime() - 1000).toISOString();
    const expiry = now.toISOString();
    expect(isBaroActive(activation, expiry)).toBe(false);
  });
});

// ─── fetchBaroDataWithFallback ───────────────────────────────────────────────

describe('fetchBaroDataWithFallback', () => {
  beforeEach(() => {
    resetSimulation();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns warframestat data when it has inventory', async () => {
    const baro = activeBaro([{ item: 'Primed Flow', ducats: 300, credits: 175000 }]);
    global.fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([baro]) });

    const result = await fetchBaroDataWithFallback();
    expect(result.inventory).toHaveLength(1);
    expect(result.location).toBe('Test Relay');
  });

  it('falls back to backend when warframestat throws', async () => {
    const items = [{ name: 'Primed Flow', uniqueName: '/Lotus/Upgrades/Mods/Fusionbased/PrimedFlow', creditPrice: 175000, ducatPrice: 300 }];
    global.fetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(backendCurrent(items)) });

    const result = await fetchBaroDataWithFallback();
    expect(result.inventory).toEqual([
      { uniqueName: '/Lotus/Upgrades/Mods/Fusionbased/PrimedFlow', item: 'Primed Flow', ducats: 300, credits: 175000 },
    ]);
    expect(result.location).toBe('Backend Relay');
  });

  it('falls back to backend when active Baro has empty inventory', async () => {
    const baro = activeBaro([]);
    const items = [{ name: 'Primed Flow', uniqueName: '/Lotus/Upgrades/Mods/Fusionbased/PrimedFlow', creditPrice: 175000, ducatPrice: 300 }];
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([baro]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(backendCurrent(items)) });

    const result = await fetchBaroDataWithFallback();
    expect(result.inventory).toEqual([
      { uniqueName: '/Lotus/Upgrades/Mods/Fusionbased/PrimedFlow', item: 'Primed Flow', ducats: 300, credits: 175000 },
    ]);
    expect(result.location).toBe('Backend Relay');
  });

  it('keeps warframestat response when backend also has empty inventory', async () => {
    const baro = activeBaro([]);
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([baro]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(backendCurrent([])) });

    const result = await fetchBaroDataWithFallback();
    expect(result.inventory).toEqual([]);
    expect(result.location).toBe('Test Relay');
  });

  it('keeps warframestat response when backend fallback fails for empty inventory', async () => {
    const baro = activeBaro([]);
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([baro]) })
      .mockResolvedValueOnce({ ok: false, status: 500 });

    const result = await fetchBaroDataWithFallback();
    expect(result.inventory).toEqual([]);
    expect(result.location).toBe('Test Relay');
  });

  it('throws when both warframestat and backend fail', async () => {
    global.fetch
      .mockRejectedValueOnce(new Error('API down'))
      .mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(fetchBaroDataWithFallback()).rejects.toThrow('API down');
  });
});
