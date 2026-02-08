/**
 * Tests for the logger utility.
 * Verifies conditional logging based on NODE_ENV.
 */

describe('logger', () => {
  let logger;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
    jest.resetModules();
  });

  describe('in development (NODE_ENV !== "production")', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      jest.resetModules();
      logger = require('../../utils/logger').logger;
    });

    it('log() calls console.log', () => {
      logger.log('hello', 'world');
      expect(console.log).toHaveBeenCalledWith('hello', 'world');
    });

    it('warn() calls console.warn', () => {
      logger.warn('warning!');
      expect(console.warn).toHaveBeenCalledWith('warning!');
    });

    it('error() calls console.error', () => {
      logger.error('error!');
      expect(console.error).toHaveBeenCalledWith('error!');
    });

    it('debug() logs with [prefix] format', () => {
      logger.debug('Baro', 'fetching data');
      expect(console.log).toHaveBeenCalledWith('[Baro]', 'fetching data');
    });

    it('info() logs with emoji prefix', () => {
      logger.info('🔄', 'refreshing');
      expect(console.log).toHaveBeenCalledWith('🔄', 'refreshing');
    });
  });

  describe('in production (NODE_ENV === "production")', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      logger = require('../../utils/logger').logger;
    });

    it('log() does NOT call console.log', () => {
      logger.log('should not appear');
      expect(console.log).not.toHaveBeenCalled();
    });

    it('warn() does NOT call console.warn', () => {
      logger.warn('should not appear');
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('error() STILL calls console.error', () => {
      logger.error('always logged');
      expect(console.error).toHaveBeenCalledWith('always logged');
    });

    it('debug() does NOT call console.log', () => {
      logger.debug('Prefix', 'should not appear');
      expect(console.log).not.toHaveBeenCalled();
    });

    it('info() does NOT call console.log', () => {
      logger.info('🔄', 'should not appear');
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
