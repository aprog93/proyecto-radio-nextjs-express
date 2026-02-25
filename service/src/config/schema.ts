import type { Database as SqlJsDatabase } from 'sql.js';
import bcrypt from 'bcryptjs';

/**
 * Inicializa el esquema de la base de datos
 */
export function initializeSchema(db: SqlJsDatabase): void {
  try {
    // Crear tabla de usuarios
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        displayName TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'listener',
        avatar TEXT,
        bio TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        isActive BOOLEAN DEFAULT 1
      )
    `);

    // Crear tabla de perfiles de usuario
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
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Crear tabla de blogs
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
        published BOOLEAN DEFAULT 0,
        viewCount INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        publishedAt DATETIME,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Crear tabla de noticias
    db.run(`
      CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        image TEXT,
        published BOOLEAN DEFAULT 0,
        expiresAt DATETIME,
        viewCount INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        publishedAt DATETIME,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Crear tabla de eventos
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
        published BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        publishedAt DATETIME,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Crear tabla de registros a eventos
    db.run(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(event_id, user_id)
      )
    `);

    // Crear tabla de programación
    db.run(`
      CREATE TABLE IF NOT EXISTS schedule (
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
      )
    `);

    // Crear tabla de productos
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image TEXT,
        category TEXT,
        stock INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de pedidos
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status TEXT DEFAULT 'pending',
        items TEXT NOT NULL,
        shippingAddress TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Crear tabla de donaciones
    db.run(`
      CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount DECIMAL(10, 2) NOT NULL,
        currency TEXT DEFAULT 'CAD',
        message TEXT,
        anonymous BOOLEAN DEFAULT 0,
        email TEXT,
        transactionId TEXT,
        status TEXT DEFAULT 'completed',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de comentarios
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        blog_id INTEGER,
        news_id INTEGER,
        event_id INTEGER,
        approved BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
        FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);

    // Crear índices para mejorar búsquedas
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author_id);
      CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
      CREATE INDEX IF NOT EXISTS idx_news_author ON news(author_id);
      CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
      CREATE INDEX IF NOT EXISTS idx_events_author ON events(author_id);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Crear super-admin predeterminado si no existe
    createDefaultAdmin(db);

    console.log('✓ Esquema de base de datos inicializado');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

/**
 * Crea el usuario super-admin predeterminado
 */
function createDefaultAdmin(db: SqlJsDatabase): void {
  try {
    const existingAdmin = db.exec(
      'SELECT id FROM users WHERE email = ?',
      ['admin@radiocesar.local']
    );

    if (!existingAdmin || existingAdmin.length === 0 || existingAdmin[0]?.values?.length === 0) {
      const hashedPassword = bcrypt.hashSync('admin', 10);

      db.run(
        `INSERT INTO users (email, password, displayName, role, isActive)
         VALUES (?, ?, ?, ?, ?)`,
        ['admin@radiocesar.local', hashedPassword, 'Admin', 'admin', 1]
      );

      console.log('✓ Super-admin creado (email: admin@radiocesar.local, password: admin)');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}
