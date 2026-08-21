/**
 * Tests for shouldBlockOnSync — the rule deciding when the syncing state is
 * allowed to take over the Baro screen.
 *
 * Regression cover: after Baro arrives, the backend creates item documents the
 * device's cache has never seen, so a cold start finds unmatched items and
 * enters the syncing state. That used to blank the whole screen behind
 * "Retrieving Baro Ki'Teer's Inventory..." for up to 7.5 minutes of background
 * re-match retries, which reads as a hang.
 */
import { shouldBlockOnSync } from '../../screens/BaroScreen';

jest.mock('../../contexts/InventoryContext', () => ({ useInventory: jest.fn() }));
jest.mock('../../contexts/WishlistContext', () => ({ useWishlist: jest.fn() }));
jest.mock('../../contexts/UserActionsContext', () => ({ useUserActions: jest.fn() }));

describe('shouldBlockOnSync', () => {
  it('blocks when syncing with nothing to show', () => {
    // The arrival flow: Baro was away, inventory is genuinely empty
    expect(shouldBlockOnSync(true, 0)).toBe(true);
  });

  it('does NOT block when syncing but items are already available', () => {
    // The regression: one unrecognised item must not hide the other 20
    expect(shouldBlockOnSync(true, 21)).toBe(false);
  });

  it('does not block a single item behind the loader', () => {
    expect(shouldBlockOnSync(true, 1)).toBe(false);
  });

  it('never blocks when not syncing', () => {
    expect(shouldBlockOnSync(false, 0)).toBe(false);
    expect(shouldBlockOnSync(false, 12)).toBe(false);
  });
});
