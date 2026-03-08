/**
 * Logger utility for conditional logging
 * Prevents console logs in production while keeping error reporting
 */

// Enable debug logs in development only
const __DEV__ = process.env.NODE_ENV !== 'production';

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  log: (...args) => {
    if (__DEV__) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },

  /**
   * Log errors (always logged, even in production)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Log debug information with a prefix (only in development)
   */
  debug: (prefix, ...args) => {
    if (__DEV__) {
      console.log(`[${prefix}]`, ...args);
    }
  },

  /**
   * Log with emoji prefix for categorization (only in development)
   */
  info: (emoji, ...args) => {
    if (__DEV__) {
      console.log(emoji, ...args);
    }
  },
};

export default logger;
