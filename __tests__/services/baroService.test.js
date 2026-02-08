import { isBaroActive } from '../../services/baroService';

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
