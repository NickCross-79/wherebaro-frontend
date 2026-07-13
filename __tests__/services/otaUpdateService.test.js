import * as Updates from 'expo-updates';
import { checkForOtaUpdate } from '../../services/otaUpdateService';

jest.mock('expo-updates', () => ({
  isEnabled: true,
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
}));

describe('checkForOtaUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Updates.isEnabled = true;
  });

  it('does nothing when updates are disabled (dev/Expo Go)', async () => {
    Updates.isEnabled = false;

    await checkForOtaUpdate();

    expect(Updates.checkForUpdateAsync).not.toHaveBeenCalled();
  });

  it('does nothing further when no update is available', async () => {
    Updates.checkForUpdateAsync.mockResolvedValueOnce({ isAvailable: false });

    await checkForOtaUpdate();

    expect(Updates.checkForUpdateAsync).toHaveBeenCalledTimes(1);
    expect(Updates.fetchUpdateAsync).not.toHaveBeenCalled();
  });

  it('fetches the update when one is available', async () => {
    Updates.checkForUpdateAsync.mockResolvedValueOnce({ isAvailable: true });
    Updates.fetchUpdateAsync.mockResolvedValueOnce({ isNew: true });

    await checkForOtaUpdate();

    expect(Updates.fetchUpdateAsync).toHaveBeenCalledTimes(1);
  });

  it('swallows errors from a failed check', async () => {
    Updates.checkForUpdateAsync.mockRejectedValueOnce(new Error('network down'));

    await expect(checkForOtaUpdate()).resolves.toBeUndefined();
  });

  it('does not run overlapping checks', async () => {
    let resolveCheck;
    Updates.checkForUpdateAsync.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCheck = resolve;
      })
    );

    const first = checkForOtaUpdate();
    await checkForOtaUpdate(); // should be a no-op while first is in flight

    resolveCheck({ isAvailable: false });
    await first;

    expect(Updates.checkForUpdateAsync).toHaveBeenCalledTimes(1);
  });
});
