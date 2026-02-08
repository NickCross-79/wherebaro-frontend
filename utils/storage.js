import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// Expo SecureStore wrapper for MMKV-like functionality
class SecureStorage {
  async setItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, String(value));
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  }

  async getItem(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  }

  async deleteItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore deleteItem error:', error);
    }
  }
}

// SecureStore instance for app state and settings
export const secureStorage = new SecureStorage();

// SQLite database instance
let db = null;
let dbQueue = Promise.resolve();

// Serialize DB write operations to prevent concurrent access crashes
const withDbQueue = (fn) => {
  dbQueue = dbQueue.then(fn, fn);
  return dbQueue;
};

const ensureDb = async () => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('wherebaro.db');
  await createTables();
  return db;
};

export const initializeDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('wherebaro.db');
    await createTables();
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

const createTables = async () => {
  if (!db) return;

  try {
    // Single items table with wishlist flag
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        _id TEXT UNIQUE,
        name TEXT NOT NULL,
        type TEXT,
        image TEXT,
        creditPrice INTEGER,
        ducatPrice INTEGER,
        likes TEXT,
        reviews TEXT,
        offeringDates TEXT,
        uniqueName TEXT,
        inWishlist INTEGER DEFAULT 0,
        createdAt INTEGER,
        cachedAt INTEGER
      );
    `);
    console.log('Items table created');

    // Create index on wishlist flag for fast queries
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_wishlist ON items(inWishlist);
    `);
    console.log('Wishlist index created');

    const columns = await db.getAllAsync('PRAGMA table_info(items)');
    const hasOfferingDates = columns.some((column) => column.name === 'offeringDates');
    if (!hasOfferingDates) {
      await db.execAsync('ALTER TABLE items ADD COLUMN offeringDates TEXT;');
    }
    const hasUniqueName = columns.some((column) => column.name === 'uniqueName');
    if (!hasUniqueName) {
      await db.execAsync('ALTER TABLE items ADD COLUMN uniqueName TEXT;');
    }
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

// SecureStore Helper functions
export const storageHelpers = {
  // UID management
  getOrCreateUID: async () => {
    let uid = await secureStorage.getItem('uid');
    if (!uid) {
      uid = uuidv4();
      await secureStorage.setItem('uid', uid);
    }
    return uid;
  },

  setUsername: async (username) => {
    await secureStorage.setItem('username', username);
  },

  getUsername: async () => {
    const username = await secureStorage.getItem('username');
    return username || 'Anonymous';
  },

  // App state
  setLastDataRefresh: async (timestamp) => {
    await secureStorage.setItem('lastDataRefresh', timestamp.toString());
  },

  getLastDataRefresh: async () => {
    const value = await secureStorage.getItem('lastDataRefresh');
    return parseInt(value || '0', 10);
  },

  setIsFirstLaunch: async (isFirst) => {
    await secureStorage.setItem('isFirstLaunch', isFirst.toString());
  },

  getIsFirstLaunch: async () => {
    const value = await secureStorage.getItem('isFirstLaunch');
    return value !== 'false';
  },

  // Filter settings
  setFilters: async (filters) => {
    await secureStorage.setItem('filters', JSON.stringify(filters));
  },

  getFilters: async () => {
    const value = await secureStorage.getItem('filters');
    if (!value) {
      return { categories: [], popularity: 'all' };
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('Error parsing stored filters:', error);
      return { categories: [], popularity: 'all' };
    }
  },

  // Settings
  setTheme: async (theme) => {
    await secureStorage.setItem('theme', theme);
  },

  getTheme: async () => {
    const value = await secureStorage.getItem('theme');
    return value || 'dark';
  },

  setLanguage: async (language) => {
    await secureStorage.setItem('language', language);
  },

  getLanguage: async () => {
    const value = await secureStorage.getItem('language');
    return value || 'en';
  },

  // Generic get/set
  set: async (key, value) => {
    await secureStorage.setItem(key, value.toString());
  },

  get: async (key) => {
    return await secureStorage.getItem(key);
  },

  getBoolean: async (key, defaultValue = false) => {
    const value = await secureStorage.getItem(key);
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return value === 'true';
  },

  setBoolean: async (key, value) => {
    await secureStorage.setItem(key, value.toString());
  },

  remove: async (key) => {
    await secureStorage.deleteItem(key);
  },

  // Baro response cache (lightweight)
  setBaroResponse: async (response) => {
    await secureStorage.setItem('baroResponse', JSON.stringify(response));
  },

  getBaroResponse: async () => {
    const value = await secureStorage.getItem('baroResponse');
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('Error parsing Baro response:', error);
      return null;
    }
  },

  clearBaroResponse: async () => {
    await secureStorage.deleteItem('baroResponse');
  },
};

// SQLite Helper functions
export const dbHelpers = {
  // Wishlist operations
  addToWishlist: async (item) => {
    return withDbQueue(async () => {
      try {
        await ensureDb();
        const itemId = item.id || item._id;
        const now = Date.now();
        const existingItem = await db.getFirstAsync(
          `SELECT createdAt FROM items WHERE id = ? OR _id = ?`,
          [itemId, itemId]
        );
        const createdAt = existingItem?.createdAt || now;

        await db.runAsync(
          `INSERT OR REPLACE INTO items (id, _id, name, type, image, creditPrice, ducatPrice, likes, reviews, offeringDates, inWishlist, createdAt, cachedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            item._id || itemId,
            item.name,
            item.type,
            item.image,
            item.creditPrice || 0,
            item.ducatPrice || 0,
            JSON.stringify(item.likes || []),
            JSON.stringify(item.reviews || []),
            JSON.stringify(item.offeringDates || []),
            1,
            createdAt,
            now,
          ]
        );
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
      }
    });
  },

  removeFromWishlist: async (itemId) => {
    return withDbQueue(async () => {
      try {
        await ensureDb();
        await db.runAsync(
          `UPDATE items SET inWishlist = 0 WHERE id = ? OR _id = ?`,
          [itemId, itemId]
        );
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
      }
    });
  },

  getWishlistItems: async () => {
    try {
      await ensureDb();
      const result = await db.getAllAsync(
        `SELECT * FROM items WHERE inWishlist = 1 ORDER BY createdAt DESC`
      );
      return result.map((row) => ({
        ...row,
        likes: JSON.parse(row.likes || '[]'),
        reviews: JSON.parse(row.reviews || '[]'),
        offeringDates: JSON.parse(row.offeringDates || '[]'),
      }));
    } catch (error) {
      console.error('Error getting wishlist items:', error);
      return [];
    }
  },

  getWishlistIds: async () => {
    try {
      await ensureDb();
      const result = await db.getAllAsync(
        `SELECT id, _id FROM items WHERE inWishlist = 1`
      );
      return result.map((row) => row.id || row._id);
    } catch (error) {
      console.error('Error getting wishlist IDs:', error);
      return [];
    }
  },

  isInWishlist: async (itemId) => {
    try {
      await ensureDb();
      const result = await db.getFirstAsync(
        `SELECT id FROM items WHERE (id = ? OR _id = ?) AND inWishlist = 1 LIMIT 1`,
        [itemId, itemId]
      );
      return result !== null;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  },

  // Items cache operations (now uses single items table)
  cacheItems: async (items) => {
    return withDbQueue(async () => {
      try {
        await ensureDb();
        const now = Date.now();

        // Batch-read existing items to preserve wishlist/createdAt without N+1 queries
        const existingRows = await db.getAllAsync(
          `SELECT id, _id, inWishlist, createdAt FROM items`
        );
        const existingMap = new Map();
        for (const row of existingRows) {
          if (row.id) existingMap.set(row.id, row);
          if (row._id && row._id !== row.id) existingMap.set(row._id, row);
        }

        await db.withTransactionAsync(async () => {
          for (const item of items) {
            const itemId = item.id || item._id;
            const existingItem = existingMap.get(itemId);
            const inWishlist = existingItem?.inWishlist || 0;
            const createdAt = existingItem?.createdAt || now;

            await db.runAsync(
              `INSERT OR REPLACE INTO items (id, _id, name, type, image, creditPrice, ducatPrice, likes, reviews, offeringDates, uniqueName, inWishlist, createdAt, cachedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                itemId,
                item._id || itemId,
                item.name,
                item.type,
                item.image,
                item.creditPrice || 0,
                item.ducatPrice || 0,
                JSON.stringify(item.likes || []),
                JSON.stringify(item.reviews || []),
                JSON.stringify(item.offeringDates || []),
                item.uniqueName || null,
                inWishlist,
                createdAt,
                now,
              ]
            );
          }
        });
      } catch (error) {
        console.error('Error caching items:', error);
        throw error;
      }
    });
  },

  getCachedItems: async () => {
    try {
      await ensureDb();
      const result = await db.getAllAsync(
        `SELECT * FROM items ORDER BY id ASC`
      );
      return result.map((row) => ({
        ...row,
        likes: JSON.parse(row.likes || '[]'),
        reviews: JSON.parse(row.reviews || '[]'),
        offeringDates: JSON.parse(row.offeringDates || '[]'),
      }));
    } catch (error) {
      console.error('Error getting cached items:', error);
      return [];
    }
  },

  clearItemsCache: async () => {
    return withDbQueue(async () => {
      try {
        await ensureDb();
        await db.runAsync(`DELETE FROM items WHERE inWishlist = 0`);
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
    });
  },

  updateItemInCache: async (itemId, updates) => {
    return withDbQueue(async () => {
      try {
        await ensureDb();
        const setClause = Object.keys(updates)
          .map((key) => `${key} = ?`)
          .join(', ');
        const values = Object.values(updates);
        
        await db.runAsync(
          `UPDATE items SET ${setClause} WHERE id = ? OR _id = ?`,
          [...values, itemId, itemId]
        );
      } catch (error) {
        console.error('Error updating item in cache:', error);
        throw error;
      }
    });
  },

  updateItemLikes: async (itemId, likeCount) => {
    return withDbQueue(async () => {
      try {
        await ensureDb();
        if (!db) return;
        const likesValue = JSON.stringify(likeCount);
        await db.runAsync(
          `UPDATE items SET likes = ? WHERE id = ? OR _id = ?`,
          [likesValue, itemId, itemId]
        );
      } catch (error) {
        console.error('Error updating item likes:', error);
      }
    });
  },
};

export default {
  initializeDatabase,
  secureStorage,
  storageHelpers,
  dbHelpers,
};
