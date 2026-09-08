/**
 * Tests for pushNotificationService registration and preference syncing.
 *
 * These pin the behaviour behind "I turned departure alerts off but still got a
 * departure notification": the backend only knows what this module tells it, so
 * a skipped or defaulted registration silently re-subscribes the device.
 */
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExponentPushToken[abc]' }),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { HIGH: 4 },
}));

jest.mock('expo-device', () => ({ isDevice: true }));

jest.mock('../../services/api', () => ({
  registerPushToken: jest.fn().mockResolvedValue({ success: true }),
  removePushToken: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../../utils/storage', () => {
  const store = new Map();
  return {
    __store: store,
    storageHelpers: {
      get: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
      set: jest.fn(async (key, value) => { store.set(key, String(value)); }),
      remove: jest.fn(async (key) => { store.delete(key); }),
      getOrCreateUID: jest.fn(async () => 'device-uid-1'),
    },
  };
});

import {
  registerForPushNotifications,
  updateNotificationPreferences,
} from '../../services/pushNotificationService';
import { registerPushToken } from '../../services/api';

const { __store: store } = jest.requireMock('../../utils/storage');

const TOKEN = 'ExponentPushToken[abc]';

/** Put the device in the "already registered with these prefs" state. */
const seedRegistered = (arrival, departure) => {
  store.set('expoPushToken', TOKEN);
  store.set('pushTokenRegistered', 'true');
  store.set('pushTokenPrefs', `arrival=${arrival},departure=${departure}`);
};

beforeEach(() => {
  jest.clearAllMocks();
  store.clear();
});

describe('registerForPushNotifications', () => {
  it('sends the preferences it was given', async () => {
    await registerForPushNotifications(true, false);

    expect(registerPushToken).toHaveBeenCalledWith(TOKEN, 'device-uid-1', true, false);
  });

  it('records the registered preferences so later launches can compare', async () => {
    await registerForPushNotifications(true, false);

    expect(store.get('pushTokenPrefs')).toBe('arrival=true,departure=false');
  });

  it('skips the round-trip when token and preferences are both unchanged', async () => {
    seedRegistered(true, false);

    await registerForPushNotifications(true, false);

    expect(registerPushToken).not.toHaveBeenCalled();
  });

  it('re-registers when the preferences differ from what the backend was told', async () => {
    // The device is registered for everything but the user has since opted out
    // of departure. This must reach the backend, not be skipped as "unchanged".
    seedRegistered(true, true);

    await registerForPushNotifications(true, false);

    expect(registerPushToken).toHaveBeenCalledWith(TOKEN, 'device-uid-1', true, false);
  });

  it('re-registers a device that has no recorded preferences yet', async () => {
    // Devices registered before preferences were tracked: their backend state
    // may be wrong, so the first launch after the fix must resend it.
    store.set('expoPushToken', TOKEN);
    store.set('pushTokenRegistered', 'true');

    await registerForPushNotifications(false, false);

    expect(registerPushToken).toHaveBeenCalledWith(TOKEN, 'device-uid-1', false, false);
  });
});

describe('updateNotificationPreferences', () => {
  it('sends the new preferences and records them', async () => {
    seedRegistered(true, true);

    await updateNotificationPreferences(true, false);

    expect(registerPushToken).toHaveBeenCalledWith(TOKEN, 'device-uid-1', true, false);
    expect(store.get('pushTokenPrefs')).toBe('arrival=true,departure=false');
  });
});

// The unregister paths are not covered here: both reach ./api through a dynamic
// `await import()`, which Jest cannot execute without --experimental-vm-modules
// (Metro handles it fine). A test would swallow the resulting error and assert
// nothing useful.
