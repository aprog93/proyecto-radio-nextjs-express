import { beforeEach, afterEach } from 'vitest';
import initSqlJs from 'sql.js';
import type { Database as SqlJsDatabase } from 'sql.js';
import { DatabaseWrapper } from '@/config/db-wrapper.js';

/**
 * Test utilities for database setup and teardown
 */

let sqlJs: any;
let testDbInstance: SqlJsDatabase | null = null;

/**
 * Initialize SQL.js (call once in beforeAll or at module level)
 */
export async function initializeSqlJs() {
  if (!sqlJs) {
    sqlJs = await initSqlJs();
  }
  return sqlJs;
}

/**
 * Create an in-memory test database with schema
 */
export async function createTestDatabase(): Promise<DatabaseWrapper> {
  const SQL = await initializeSqlJs();
  const db = new SQL.Database();

  // Create tables schema
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      displayName TEXT NOT NULL,
      role TEXT DEFAULT 'listener',
      avatar TEXT,
      bio TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      isActive INTEGER DEFAULT 1
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER UNIQUE NOT NULL,
      firstName TEXT,
      lastName TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      country TEXT,
      postalCode TEXT,
      socialMedia TEXT,
      preferences TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT,
      author_id INTEGER NOT NULL,
      category TEXT,
      tags TEXT,
      image TEXT,
      published INTEGER DEFAULT 0,
      viewCount INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      publishedAt DATETIME,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      image TEXT,
      published INTEGER DEFAULT 0,
      expiresAt DATETIME,
      viewCount INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      publishedAt DATETIME,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      startDate DATETIME NOT NULL,
      endDate DATETIME NOT NULL,
      location TEXT,
      image TEXT,
      capacity INTEGER,
      registered INTEGER DEFAULT 0,
      author_id INTEGER NOT NULL,
      published INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      publishedAt DATETIME,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      dayOfWeek INTEGER NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      host TEXT,
      image TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT,
      stock INTEGER DEFAULT 0,
      published INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      items TEXT,
      shippingAddress TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      message TEXT,
      anonymous INTEGER DEFAULT 0,
      email TEXT,
      transactionId TEXT,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      blog_id INTEGER,
      news_id INTEGER,
      event_id INTEGER,
      approved INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (blog_id) REFERENCES blogs(id),
      FOREIGN KEY (news_id) REFERENCES news(id),
      FOREIGN KEY (event_id) REFERENCES events(id)
    );
  `);

  testDbInstance = db;
  return new DatabaseWrapper(db);
}

/**
 * Clean up test database
 */
export async function cleanupTestDatabase() {
  if (testDbInstance) {
    testDbInstance.close();
    testDbInstance = null;
  }
}

/**
 * Get the current test database instance
 */
export function getTestDatabase(): SqlJsDatabase | null {
  return testDbInstance;
}

/**
 * Helper hook for tests to set up and tear down database
 */
export function setupTestDatabase() {
  let db: DatabaseWrapper | null = null;

  beforeEach(async () => {
    db = await createTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  return {
    getDb: () => db,
  };
}

/**
 * Seed test database with initial data
 */
export async function seedTestDatabase(
  db: DatabaseWrapper,
  data: Record<string, any[]>
) {
  // This would insert test data into the database
  // Implementation depends on specific needs
}

/**
 * Clear all tables in test database
 */
export async function clearTestDatabase(db: DatabaseWrapper) {
  const sqlDb = getTestDatabase();
  if (sqlDb) {
    const tables = [
      'comments',
      'donations',
      'orders',
      'products',
      'schedules',
      'event_registrations',
      'events',
      'news',
      'blogs',
      'user_profiles',
      'users',
    ];

    for (const table of tables) {
      try {
        sqlDb.run(`DELETE FROM ${table}`);
      } catch (error) {
        // Table might not exist, continue
      }
    }
  }
}
