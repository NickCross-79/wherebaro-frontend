/**
 * Tests for userStorage utility.
 * All functions delegate to storageHelpers, so we mock storage.
 */
import {
  getCurrentUID,
  getCurrentUsername,
  setCurrentUsername,
  isFirstLaunch,
  getLastDataRefresh,
  getNotificationSettings,
  updateNotificationSettings,
} from '../../utils/userStorage';

// Mock storageHelpers
jest.mock('../../utils/storage', () => ({
  storageHelpers: {
    getOrCreateUID: jest.fn(),
    getUsername: jest.fn(),
    setUsername: jest.fn(),
    getIsFirstLaunch: jest.fn(),
    getLastDataRefresh: jest.fn(),
    get: jest.fn(),
    getBoolean: jest.fn(),
    setBoolean: jest.fn(),
  },
}));

const { storageHelpers } = require('../../utils/storage');

describe('userStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUID', () => {
    it('delegates to storageHelpers.getOrCreateUID', async () => {
      storageHelpers.getOrCreateUID.mockResolvedValue('uid-123');
      const result = await getCurrentUID();
      expect(result).toBe('uid-123');
      expect(storageHelpers.getOrCreateUID).toHaveBeenCalled();
    });
  });

  describe('getCurrentUsername', () => {
    it('delegates to storageHelpers.getUsername', async () => {
      storageHelpers.getUsername.mockResolvedValue('TestUser');
      const result = await getCurrentUsername();
      expect(result).toBe('TestUser');
    });
  });

  describe('setCurrentUsername', () => {
    it('delegates to storageHelpers.setUsername', async () => {
      await setCurrentUsername('NewUser');
      expect(storageHelpers.setUsername).toHaveBeenCalledWith('NewUser');
    });
  });

  describe('isFirstLaunch', () => {
    it('delegates to storageHelpers.getIsFirstLaunch', async () => {
      storageHelpers.getIsFirstLaunch.mockResolvedValue(true);
      const result = await isFirstLaunch();
      expect(result).toBe(true);
    });
  });

  describe('getLastDataRefresh', () => {
    it('delegates to storageHelpers.getLastDataRefresh', async () => {
      storageHelpers.getLastDataRefresh.mockResolvedValue(1700000000);
      const result = await getLastDataRefresh();
      expect(result).toBe(1700000000);
    });
  });

  describe('getNotificationSettings', () => {
    // Arrival/wishlist/auto-refresh come from getBoolean; departure is read raw
    // so a never-written key can be told apart from an explicit false.
    const mockStored = ({ arrival = true, departure, wishlist = true, autoRefresh = false }) => {
      storageHelpers.getBoolean.mockImplementation(async (key) => ({
        notificationsEnabled: arrival,
        wishlistAlertsEnabled: wishlist,
        autoRefreshEnabled: autoRefresh,
      }[key]));
      storageHelpers.get.mockResolvedValue(departure);
    };

    it('returns the four alert settings from storageHelpers', async () => {
      mockStored({ arrival: true, departure: true, wishlist: false, autoRefresh: true });

      const result = await getNotificationSettings();
      expect(result).toEqual({
        arrivalAlerts: true,
        departureAlerts: true,
        wishlistAlerts: false,
        autoRefresh: true,
      });
      expect(storageHelpers.getBoolean).toHaveBeenCalledWith('notificationsEnabled', true);
      expect(storageHelpers.get).toHaveBeenCalledWith('departureAlertsEnabled');
      expect(storageHelpers.getBoolean).toHaveBeenCalledWith('wishlistAlertsEnabled', true);
      expect(storageHelpers.getBoolean).toHaveBeenCalledWith('autoRefreshEnabled', false);
    });

    it('reads a departure preference stored as a string', async () => {
      mockStored({ departure: 'true' });
      expect((await getNotificationSettings()).departureAlerts).toBe(true);
    });

    it('respects an explicit departure opt-out', async () => {
      mockStored({ arrival: true, departure: false });
      expect((await getNotificationSettings()).departureAlerts).toBe(false);
    });

    // Migration guard: users who had alerts off before the toggle was split
    // must not start receiving departure alerts.
    it('mirrors the arrival setting when departure has never been set', async () => {
      mockStored({ arrival: false, departure: null });
      expect((await getNotificationSettings()).departureAlerts).toBe(false);

      mockStored({ arrival: true, departure: undefined });
      expect((await getNotificationSettings()).departureAlerts).toBe(true);
    });
  });

  describe('updateNotificationSettings', () => {
    it('sets arrivalAlerts when provided as boolean', async () => {
      await updateNotificationSettings({ arrivalAlerts: false });
      expect(storageHelpers.setBoolean).toHaveBeenCalledWith('notificationsEnabled', false);
    });

    it('sets departureAlerts when provided as boolean', async () => {
      await updateNotificationSettings({ departureAlerts: true });
      expect(storageHelpers.setBoolean).toHaveBeenCalledWith('departureAlertsEnabled', true);
    });

    it('sets wishlistAlerts when provided as boolean', async () => {
      await updateNotificationSettings({ wishlistAlerts: true });
      expect(storageHelpers.setBoolean).toHaveBeenCalledWith('wishlistAlertsEnabled', true);
    });

    it('sets autoRefresh when provided as boolean', async () => {
      await updateNotificationSettings({ autoRefresh: true });
      expect(storageHelpers.setBoolean).toHaveBeenCalledWith('autoRefreshEnabled', true);
    });

    it('does nothing for non-boolean values', async () => {
      await updateNotificationSettings({ arrivalAlerts: 'yes' });
      expect(storageHelpers.setBoolean).not.toHaveBeenCalled();
    });

    it('does nothing for empty object', async () => {
      await updateNotificationSettings({});
      expect(storageHelpers.setBoolean).not.toHaveBeenCalled();
    });
  });
});
