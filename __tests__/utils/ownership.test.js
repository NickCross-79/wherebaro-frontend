import { isOwnEntry } from '../../utils/ownership';

describe('isOwnEntry', () => {
  it('trusts the backend isOwn flag', () => {
    expect(isOwnEntry({ isOwn: true }, 'me')).toBe(true);
    expect(isOwnEntry({ isOwn: false }, 'me')).toBe(false);
  });

  it('recognises an entry this app created, which still carries its own uid', () => {
    expect(isOwnEntry({ uid: 'me' }, 'me')).toBe(true);
    expect(isOwnEntry({ uid: 'someone-else' }, 'me')).toBe(false);
  });

  it('is false with no entry or no uid to compare against', () => {
    expect(isOwnEntry(null, 'me')).toBe(false);
    expect(isOwnEntry({ uid: 'me' }, undefined)).toBe(false);
    expect(isOwnEntry({}, 'me')).toBe(false);
  });
});
