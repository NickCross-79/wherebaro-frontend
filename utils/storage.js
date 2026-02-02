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
    // Wishlist table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id TEXT PRIMARY KEY,
        _id TEXT UNIQUE,
        name TEXT NOT NULL,
        type TEXT,
        image TEXT,
        creditPrice INTEGER,
        ducatPrice INTEGER,
        likes TEXT,
        reviews TEXT,
        createdAt INTEGER
      );
    `);
    console.log('Wishlist table created');

    // Items cache table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS items_cache (
        id TEXT PRIMARY KEY,
        _id TEXT UNIQUE,
        name TEXT NOT NULL,
        type TEXT,
        image TEXT,
        creditPrice INTEGER,
        ducatPrice INTEGER,
        likes TEXT,
        reviews TEXT,
        createdAt INTEGER,
        cachedAt INTEGER
      );
    `);
    console.log('Items cache table created');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

// SecureStore Helper functions (replacing MMKV)
export const mmkvHelpers = {
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
  setLastBaroCheck: async (timestamp) => {
    await secureStorage.setItem('lastBaroCheck', timestamp.toString());
  },

  getLastBaroCheck: async () => {
    const value = await secureStorage.getItem('lastBaroCheck');
    return parseInt(value || '0', 10);
  },

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
    return value === 'true' || defaultValue;
  },

  setBoolean: async (key, value) => {
    await secureStorage.setItem(key, value.toString());
  },
};

// SQLite Helper functions
export const dbHelpers = {
  // Wishlist operations
  addToWishlist: async (item) => {
    try {
      await ensureDb();
      const itemId = item.id || item._id;
      await db.runAsync(
        `INSERT OR REPLACE INTO wishlist (id, _id, name, type, image, creditPrice, ducatPrice, likes, reviews, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          Date.now(),
        ]
      );
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  removeFromWishlist: async (itemId) => {
    try {
      await ensureDb();
      await db.runAsync(
        `DELETE FROM wishlist WHERE id = ? OR _id = ?`,
        [itemId, itemId]
      );
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  getWishlistItems: async () => {
    try {
      await ensureDb();
      const result = await db.getAllAsync(
        `SELECT * FROM wishlist ORDER BY createdAt DESC`
      );
      return result.map((row) => ({
        ...row,
        likes: JSON.parse(row.likes || '[]'),
        reviews: JSON.parse(row.reviews || '[]'),
      }));
    } catch (error) {
      console.error('Error getting wishlist items:', error);
      return [];
    }
  },

  getWishlistIds: async () => {
    try {
      await ensureDb();
      const result = await db.getAllAsync(`SELECT id, _id FROM wishlist`);
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
        `SELECT id FROM wishlist WHERE id = ? OR _id = ? LIMIT 1`,
        [itemId, itemId]
      );
      return result !== null;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  },

  // Items cache operations
  cacheItems: async (items) => {
    try {
      await ensureDb();
      const now = Date.now();
      for (const item of items) {
        const itemId = item.id || item._id;
        await db.runAsync(
          `INSERT OR REPLACE INTO items_cache (id, _id, name, type, image, creditPrice, ducatPrice, likes, reviews, cachedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            now,
          ]
        );
      }
    } catch (error) {
      console.error('Error caching items:', error);
      throw error;
    }
  },

  getCachedItems: async () => {
    try {
      await ensureDb();
      const result = await db.getAllAsync(
        `SELECT * FROM items_cache ORDER BY cachedAt DESC`
      );
      return result.map((row) => ({
        ...row,
        likes: JSON.parse(row.likes || '[]'),
        reviews: JSON.parse(row.reviews || '[]'),
      }));
    } catch (error) {
      console.error('Error getting cached items:', error);
      return [];
    }
  },

  clearItemsCache: async () => {
    try {
      await ensureDb();
      await db.runAsync(`DELETE FROM items_cache`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  updateItemInCache: async (itemId, updates) => {
    try {
      await ensureDb();
      const setClause = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(', ');
      const values = Object.values(updates);
      
      await db.runAsync(
        `UPDATE items_cache SET ${setClause} WHERE id = ? OR _id = ?`,
        [...values, itemId, itemId]
      );
    } catch (error) {
      console.error('Error updating item in cache:', error);
      throw error;
    }
  },

  updateItemLikes: async (itemId, likeCount) => {
    try {
      await ensureDb();
      const likesValue = JSON.stringify(likeCount);
      await db.runAsync(
        `UPDATE items_cache SET likes = ? WHERE id = ? OR _id = ?`,
        [likesValue, itemId, itemId]
      );
      await db.runAsync(
        `UPDATE wishlist SET likes = ? WHERE id = ? OR _id = ?`,
        [likesValue, itemId, itemId]
      );
    } catch (error) {
      console.error('Error updating item likes:', error);
      throw error;
    }
  },
};

export default {
  initializeDatabase,
  secureStorage,
  mmkvHelpers,
  dbHelpers,
};
