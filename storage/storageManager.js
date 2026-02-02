import { MMKV } from 'react-native-mmkv';
import SQLite from 'react-native-sqlite-storage';
import { v4 as uuidv4 } from 'uuid';

// MMKV instance for app state and settings
export const mmkvStorage = new MMKV();

// SQLite database instance
let db = null;

export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    SQLite.openDatabase(
      {
        name: 'wherebaro.db',
        location: 'default',
        createFromLocation: '~wherebaro.db',
      },
      (database) => {
        db = database;
        createTables();
        resolve(db);
      },
      (error) => {
        console.error('Database initialization error:', error);
        reject(error);
      }
    );
  });
};

const createTables = () => {
  if (!db) return;

  // Wishlist table
  db.executeSql(
    `CREATE TABLE IF NOT EXISTS wishlist (
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
    );`,
    [],
    () => console.log('Wishlist table created'),
    (error) => console.error('Error creating wishlist table:', error)
  );

  // Items cache table (for storing fetched items)
  db.executeSql(
    `CREATE TABLE IF NOT EXISTS items_cache (
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
    );`,
    [],
    () => console.log('Items cache table created'),
    (error) => console.error('Error creating items cache table:', error)
  );
};

// MMKV Helper functions
export const mmkvHelpers = {
  // UID management
  getOrCreateUID: () => {
    let uid = mmkvStorage.getString('uid');
    if (!uid) {
      uid = uuidv4();
      mmkvStorage.set('uid', uid);
    }
    return uid;
  },

  setUsername: (username) => {
    mmkvStorage.set('username', username);
  },

  getUsername: () => {
    return mmkvStorage.getString('username') || 'Anonymous';
  },

  // App state
  setLastBaroCheck: (timestamp) => {
    mmkvStorage.set('lastBaroCheck', timestamp.toString());
  },

  getLastBaroCheck: () => {
    return parseInt(mmkvStorage.getString('lastBaroCheck') || '0', 10);
  },

  setLastDataRefresh: (timestamp) => {
    mmkvStorage.set('lastDataRefresh', timestamp.toString());
  },

  getLastDataRefresh: () => {
    return parseInt(mmkvStorage.getString('lastDataRefresh') || '0', 10);
  },

  setIsFirstLaunch: (isFirst) => {
    mmkvStorage.set('isFirstLaunch', isFirst.toString());
  },

  getIsFirstLaunch: () => {
    return mmkvStorage.getString('isFirstLaunch') !== 'false';
  },

  // Settings
  setTheme: (theme) => {
    mmkvStorage.set('theme', theme);
  },

  getTheme: () => {
    return mmkvStorage.getString('theme') || 'dark';
  },

  setLanguage: (language) => {
    mmkvStorage.set('language', language);
  },

  getLanguage: () => {
    return mmkvStorage.getString('language') || 'en';
  },

  // Generic get/set
  set: (key, value) => {
    mmkvStorage.set(key, value.toString());
  },

  get: (key) => {
    return mmkvStorage.getString(key);
  },

  getBoolean: (key, defaultValue = false) => {
    return mmkvStorage.getString(key) === 'true' || defaultValue;
  },

  setBoolean: (key, value) => {
    mmkvStorage.set(key, value.toString());
  },
};

// SQLite Helper functions
export const dbHelpers = {
  // Wishlist operations
  addToWishlist: (item) => {
    return new Promise((resolve, reject) => {
      const itemId = item.id || item._id;
      db.executeSql(
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
        ],
        () => resolve(),
        (error) => reject(error)
      );
    });
  },

  removeFromWishlist: (itemId) => {
    return new Promise((resolve, reject) => {
      db.executeSql(
        `DELETE FROM wishlist WHERE id = ? OR _id = ?`,
        [itemId, itemId],
        () => resolve(),
        (error) => reject(error)
      );
    });
  },

  getWishlistItems: () => {
    return new Promise((resolve, reject) => {
      db.executeSql(
        `SELECT * FROM wishlist ORDER BY createdAt DESC`,
        [],
        (result) => {
          const items = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            items.push({
              ...row,
              likes: JSON.parse(row.likes || '[]'),
              reviews: JSON.parse(row.reviews || '[]'),
            });
          }
          resolve(items);
        },
        (error) => reject(error)
      );
    });
  },

  getWishlistIds: () => {
    return new Promise((resolve, reject) => {
      db.executeSql(
        `SELECT id, _id FROM wishlist`,
        [],
        (result) => {
          const ids = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            ids.push(row.id || row._id);
          }
          resolve(ids);
        },
        (error) => reject(error)
      );
    });
  },

  isInWishlist: (itemId) => {
    return new Promise((resolve, reject) => {
      db.executeSql(
        `SELECT id FROM wishlist WHERE id = ? OR _id = ? LIMIT 1`,
        [itemId, itemId],
        (result) => {
          resolve(result.rows.length > 0);
        },
        (error) => reject(error)
      );
    });
  },

  // Items cache operations
  cacheItems: (items) => {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const promises = items.map(
        (item) =>
          new Promise((res, rej) => {
            const itemId = item.id || item._id;
            db.executeSql(
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
              ],
              () => res(),
              (error) => rej(error)
            );
          })
      );

      Promise.all(promises).then(() => resolve()).catch(reject);
    });
  },

  getCachedItems: () => {
    return new Promise((resolve, reject) => {
      db.executeSql(
        `SELECT * FROM items_cache ORDER BY cachedAt DESC`,
        [],
        (result) => {
          const items = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            items.push({
              ...row,
              likes: JSON.parse(row.likes || '[]'),
              reviews: JSON.parse(row.reviews || '[]'),
            });
          }
          resolve(items);
        },
        (error) => reject(error)
      );
    });
  },

  clearItemsCache: () => {
    return new Promise((resolve, reject) => {
      db.executeSql(
        `DELETE FROM items_cache`,
        [],
        () => resolve(),
        (error) => reject(error)
      );
    });
  },

  updateItemInCache: (itemId, updates) => {
    return new Promise((resolve, reject) => {
      const setClause = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(', ');
      const values = Object.values(updates);
      values.push(itemId);

      db.executeSql(
        `UPDATE items_cache SET ${setClause} WHERE id = ? OR _id = ?`,
        [...values, itemId],
        () => resolve(),
        (error) => reject(error)
      );
    });
  },
};

export default {
  initializeDatabase,
  mmkvStorage,
  mmkvHelpers,
  dbHelpers,
};
