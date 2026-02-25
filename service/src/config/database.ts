import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeSchema } from './schema.js';
import { DatabaseWrapper } from './db-wrapper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../data/radio_cesar.db');

let SQL: any;
let db: SqlJsDatabase | null = null;
let wrapped: DatabaseWrapper | null = null;

/**
 * Inicializa y retorna la conexión a SQLite usando sql.js (wrapped)
 */
export async function getDatabase(): Promise<DatabaseWrapper> {
  if (wrapped) {
    return wrapped;
  }

  // Inicializar sql.js
  if (!SQL) {
    SQL = await initSqlJs();
  }

  // Cargar base de datos existente o crear nueva
  let data: Uint8Array | undefined;
  if (fs.existsSync(DB_PATH)) {
    data = fs.readFileSync(DB_PATH);
  }

  db = new SQL.Database(data);

  // Habilitar foreign keys
  db!.run('PRAGMA foreign_keys = ON');

  // Inicializar schema
  initializeSchema(db!);

  // Wrappear la base de datos
  wrapped = new DatabaseWrapper(db!);

  console.log(`✓ Base de datos conectada: ${DB_PATH}`);
  return wrapped;
}

/**
 * Persiste la base de datos a disco
 */
export function saveDatabase(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

/**
 * Cierra la conexión a la base de datos
 */
export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
    wrapped = null;
    console.log('✓ Base de datos desconectada');
  }
}

export default getDatabase;
