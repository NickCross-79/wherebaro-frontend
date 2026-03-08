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
  getAppSettings,
  updateAppSettings,
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
    getTheme: jest.fn(),
    getLanguage: jest.fn(),
    setTheme: jest.fn(),
    setLanguage: jest.fn(),
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

  describe('getAppSettings', () => {
    it('returns theme and language from storageHelpers', async () => {
      storageHelpers.getTheme.mockResolvedValue('dark');
      storageHelpers.getLanguage.mockResolvedValue('en');
      const result = await getAppSettings();
      expect(result).toEqual({ theme: 'dark', language: 'en' });
    });
  });

  describe('updateAppSettings', () => {
    it('sets theme when provided', async () => {
      await updateAppSettings({ theme: 'light' });
      expect(storageHelpers.setTheme).toHaveBeenCalledWith('light');
      expect(storageHelpers.setLanguage).not.toHaveBeenCalled();
    });

    it('sets language when provided', async () => {
      await updateAppSettings({ language: 'fr' });
      expect(storageHelpers.setLanguage).toHaveBeenCalledWith('fr');
      expect(storageHelpers.setTheme).not.toHaveBeenCalled();
    });

    it('sets both when both provided', async () => {
      await updateAppSettings({ theme: 'dark', language: 'es' });
      expect(storageHelpers.setTheme).toHaveBeenCalledWith('dark');
      expect(storageHelpers.setLanguage).toHaveBeenCalledWith('es');
    });

    it('does nothing with empty settings', async () => {
      await updateAppSettings({});
      expect(storageHelpers.setTheme).not.toHaveBeenCalled();
      expect(storageHelpers.setLanguage).not.toHaveBeenCalled();
    });
  });

  describe('getNotificationSettings', () => {
    it('returns notification settings from storageHelpers', async () => {
      storageHelpers.getBoolean
        .mockResolvedValueOnce(true)   // notifications
        .mockResolvedValueOnce(false)  // wishlistAlerts
        .mockResolvedValueOnce(true);  // autoRefresh

      const result = await getNotificationSettings();
      expect(result).toEqual({
        notifications: true,
        wishlistAlerts: false,
        autoRefresh: true,
      });
      expect(storageHelpers.getBoolean).toHaveBeenCalledWith('notificationsEnabled', true);
      expect(storageHelpers.getBoolean).toHaveBeenCalledWith('wishlistAlertsEnabled', true);
      expect(storageHelpers.getBoolean).toHaveBeenCalledWith('autoRefreshEnabled', false);
    });
  });

  describe('updateNotificationSettings', () => {
    it('sets notifications when provided as boolean', async () => {
      await updateNotificationSettings({ notifications: false });
      expect(storageHelpers.setBoolean).toHaveBeenCalledWith('notificationsEnabled', false);
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
      await updateNotificationSettings({ notifications: 'yes' });
      expect(storageHelpers.setBoolean).not.toHaveBeenCalled();
    });

    it('does nothing for empty object', async () => {
      await updateNotificationSettings({});
      expect(storageHelpers.setBoolean).not.toHaveBeenCalled();
    });
  });
});
