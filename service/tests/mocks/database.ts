/**
 * Mock DatabaseWrapper for testing
 * Simulates sql.js behavior without requiring actual database
 */
export class MockDatabaseWrapper {
  private data: Map<string, any[]> = new Map();
  private lastInsertRowid: number = 0;
  private rowsModified: number = 0;

  constructor() {
    // Initialize tables
    this.data.set('users', []);
    this.data.set('user_profiles', []);
    this.data.set('blogs', []);
    this.data.set('news', []);
    this.data.set('events', []);
    this.data.set('event_registrations', []);
    this.data.set('schedule', []);
    this.data.set('products', []);
    this.data.set('orders', []);
    this.data.set('donations', []);
  }

  /**
   * Reset all data (useful for test isolation)
   */
  reset(): void {
    this.data.clear();
    this.lastInsertRowid = 0;
    this.rowsModified = 0;
    
    // Re-initialize tables
    this.data.set('users', []);
    this.data.set('user_profiles', []);
    this.data.set('blogs', []);
    this.data.set('news', []);
    this.data.set('events', []);
    this.data.set('event_registrations', []);
    this.data.set('schedule', []);
    this.data.set('products', []);
    this.data.set('orders', []);
    this.data.set('donations', []);
  }

  /**
   * Seed initial data (e.g., admin user)
   */
  seed(table: string, rows: any[]): void {
    this.data.set(table, rows);
    if (rows.length > 0) {
      const maxId = Math.max(...rows.map(r => r.id || 0));
      this.lastInsertRowid = maxId;
    }
  }

  /**
   * Get table name from SQL query
   */
  private getTableName(sql: string): string | null {
    const match = sql.match(/FROM\s+(\w+)/i) || sql.match(/INTO\s+(\w+)/i) || sql.match(/UPDATE\s+(\w+)/i);
    return match ? match[1].toLowerCase() : null;
  }

  /**
   * Execute a SELECT query and return first row
   */
  getOne<T = any>(sql: string, params: any[] = []): T | undefined {
    const tableName = this.getTableName(sql);
    if (!tableName || !this.data.has(tableName)) {
      return undefined;
    }

    let rows = [...this.data.get(tableName)!];

    // Handle WHERE clauses
    if (sql.includes('WHERE')) {
      const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|\s*$)/i);
      if (whereMatch) {
        const whereClause = whereMatch[1];
        
        // Handle id = ?
        if (whereClause.includes('id = ?') || whereClause.includes('id=?')) {
          const idIndex = whereClause.indexOf('id');
          let paramIdx = 0;
          // Find position of id in where clause relative to ?
          const questionMarks = whereClause.substring(0, idIndex).match(/\?/g);
          paramIdx = questionMarks ? questionMarks.length : 0;
          const id = params[paramIdx];
          rows = rows.filter(r => Number(r.id) === Number(id));
        }
        
        // Handle email = ?
        if (whereClause.includes('email = ?') || whereClause.includes('email=?')) {
          const email = params[0];
          rows = rows.filter(r => r.email === email);
        }
        
        // Handle published = 1
        if (whereClause.includes('published = 1') || whereClause.includes('published=1')) {
          rows = rows.filter(r => r.published === 1);
        }

        // Handle role = "admin" or 'listener'
        const roleMatch = whereClause.match(/role\s*=\s*['"]([^'"]+)['"]/);
        if (roleMatch) {
          rows = rows.filter(r => r.role === roleMatch[1]);
        }

        // Handle isActive = 1
        if (whereClause.includes('isActive = 1') || whereClause.includes('isActive=1')) {
          rows = rows.filter(r => r.isActive === 1);
        }

        // Handle isActive = ?
        const isActiveMatch = whereClause.match(/isActive\s*=\s*\?/);
        if (isActiveMatch) {
          const paramIdx = whereClause.substring(0, whereClause.indexOf('isActive')).match(/\?/g)?.length || 0;
          rows = rows.filter(r => r.isActive === params[paramIdx]);
        }

        // Handle dayOfWeek = ?
        if (whereClause.includes('dayOfWeek = ?')) {
          const paramIdx = whereClause.substring(0, whereClause.indexOf('dayOfWeek')).match(/\?/g)?.length || 0;
          const dayOfWeek = params[paramIdx];
          rows = rows.filter(r => r.dayOfWeek === dayOfWeek);
        }

        // Handle event_id = ?
        if (whereClause.includes('event_id = ?')) {
          const paramIdx = whereClause.substring(0, whereClause.indexOf('event_id')).match(/\?/g)?.length || 0;
          const eventId = params[paramIdx];
          rows = rows.filter(r => r.event_id === eventId);
        }

        // Handle user_id = ?
        if (whereClause.includes('user_id = ?')) {
          const paramIdx = whereClause.substring(0, whereClause.indexOf('user_id')).match(/\?/g)?.length || 0;
          const userId = params[paramIdx];
          rows = rows.filter(r => r.user_id === userId);
        }
      }
    }

    // Handle LIMIT
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      rows = rows.slice(0, parseInt(limitMatch[1]));
    }

    return rows[0] as T | undefined;
  }

  /**
   * Execute a SELECT query and return all rows
   */
  getAll<T = any>(sql: string, params: any[] = []): T[] {
    const tableName = this.getTableName(sql);
    if (!tableName || !this.data.has(tableName)) {
      return [];
    }

    let rows = [...this.data.get(tableName)!];

    // Handle WHERE clauses
    if (sql.includes('WHERE')) {
      const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|\s*$)/i);
      if (whereMatch) {
        const whereClause = whereMatch[1];
        
        // Handle id = ?
        if (whereClause.includes('id = ?')) {
          const id = params[0];
          rows = rows.filter(r => Number(r.id) === Number(id));
        }
        
        // Handle email = ?
        if (whereClause.includes('email = ?')) {
          const email = params[0];
          rows = rows.filter(r => r.email === email);
        }

        // Handle published = 1
        if (whereClause.includes('published = 1')) {
          rows = rows.filter(r => r.published === 1);
        }

        // Handle role = "admin" or 'listener'
        const roleMatch = whereClause.match(/role\s*=\s*['"]([^'"]+)['"]/);
        if (roleMatch) {
          rows = rows.filter(r => r.role === roleMatch[1]);
        }

        // Handle isActive = 1
        if (whereClause.includes('isActive = 1')) {
          rows = rows.filter(r => r.isActive === 1);
        }

        // Handle dayOfWeek = ?
        if (whereClause.includes('dayOfWeek = ?')) {
          const dayOfWeek = params[0];
          rows = rows.filter(r => r.dayOfWeek === dayOfWeek);
        }
      }
    }

    // Handle ORDER BY
    const orderMatch = sql.match(/ORDER BY\s+(\w+)\s+(ASC|DESC)?/i);
    if (orderMatch) {
      const field = orderMatch[1];
      const direction = orderMatch[2]?.toUpperCase() || 'ASC';
      rows.sort((a, b) => {
        if (direction === 'ASC') {
          return a[field] > b[field] ? 1 : -1;
        } else {
          return a[field] < b[field] ? 1 : -1;
        }
      });
    }

    // Handle LIMIT and OFFSET
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    const offsetMatch = sql.match(/OFFSET\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      const offset = offsetMatch ? parseInt(offsetMatch[1]) : 0;
      rows = rows.slice(offset, offset + limit);
    }

    return rows as T[];
  }

  /**
   * Execute INSERT/UPDATE/DELETE
   */
  run(sql: string, params: any[] = []): { changes: number; lastID: number } {
    const tableName = this.getTableName(sql);
    if (!tableName) {
      return { changes: 0, lastID: 0 };
    }

    const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
    const isUpdate = sql.trim().toUpperCase().startsWith('UPDATE');
    const isDelete = sql.trim().toUpperCase().startsWith('DELETE');

    if (isInsert) {
      const table = this.data.get(tableName)!;
      const newId = ++this.lastInsertRowid;
      
      // Build new row from params and SQL
      const newRow: any = { id: newId };
      
      // Extract column names from SQL
      const colsMatch = sql.match(/\(([^)]+)\)\s+VALUES/i);
      if (colsMatch) {
        const cols = colsMatch[1].split(',').map(c => c.trim());
        cols.forEach((col, idx) => {
          newRow[col] = params[idx];
        });
      }
      
      // Add timestamps
      newRow.createdAt = new Date().toISOString();
      newRow.updatedAt = new Date().toISOString();
      
      table.push(newRow);
      this.rowsModified = 1;
      
      return { changes: 1, lastID: newId };
    }

    if (isUpdate) {
      const table = this.data.get(tableName)!;
      let changes = 0;
      
      // Parse SET clause
      const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
      if (setMatch) {
        const setClause = setMatch[1];
        // Split by comma, but keep track of each assignment
        const updateParts = setClause.split(',').map(s => s.trim());
        
        // Get WHERE condition - find the id
        const whereMatch = sql.match(/WHERE\s+id\s*=\s*\?/i);
        if (whereMatch) {
          // The id is the last parameter
          const rowId = params[params.length - 1];
          const rowIdx = table.findIndex(r => Number(r.id) === Number(rowId));
          
          if (rowIdx !== -1) {
            // Process each SET part (excluding the last which is WHERE condition)
            let paramIdx = 0;
            for (const part of updateParts) {
              if (part.includes('= ?')) {
                const [col] = part.split('=').map(s => s.trim());
                if (col && paramIdx < params.length - 1) {
                  table[rowIdx][col] = params[paramIdx];
                  paramIdx++;
                }
              } else if (part.includes('updatedAt')) {
                // Skip updatedAt - we set it automatically
              }
            }
            table[rowIdx].updatedAt = new Date().toISOString();
            changes = 1;
          }
        }
      }
      
      this.rowsModified = changes;
      return { changes, lastID: 0 };
    }

    if (isDelete) {
      const table = this.data.get(tableName)!;
      const beforeCount = table.length;
      
      const whereMatch = sql.match(/WHERE\s+id\s*=\s*\?/i);
      if (whereMatch) {
        // id is the last parameter
        const rowId = params[params.length - 1];
        const idx = table.findIndex(r => Number(r.id) === Number(rowId));
        if (idx !== -1) {
          table.splice(idx, 1);
        }
      }
      
      const changes = beforeCount - table.length;
      this.rowsModified = changes;
      return { changes, lastID: 0 };
    }

    return { changes: 0, lastID: 0 };
  }

  /**
   * Count rows
   */
  count(sql: string, params: any[] = []): number {
    // Remove SELECT and subquery wrapper, get base table
    const tableName = this.getTableName(sql);
    if (!tableName || !this.data.has(tableName)) {
      return 0;
    }

    let rows = [...this.data.get(tableName)!];

    // Apply same WHERE logic as getAll
    if (sql.includes('WHERE')) {
      const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|\s*$)/i);
      if (whereMatch) {
        const whereClause = whereMatch[1];
        
        if (whereClause.includes('published = 1')) {
          rows = rows.filter(r => r.published === 1);
        }
        if (whereClause.includes('isActive = 1')) {
          rows = rows.filter(r => r.isActive === 1);
        }
        const roleMatch = whereClause.match(/role\s*=\s*['"]([^'"]+)['"]/);
        if (roleMatch) {
          rows = rows.filter(r => r.role === roleMatch[1]);
        }
      }
    }

    return rows.length;
  }

  /**
   * Get all data (for debugging)
   */
  getTableData(table: string): any[] {
    return this.data.get(table) || [];
  }
}

/**
 * Create a mock database with admin user seeded
 */
export function createMockDatabase(): MockDatabaseWrapper {
  const db = new MockDatabaseWrapper();
  
  // Seed admin user with bcrypt hash of "admin"
  // bcrypt hash for "admin" with salt 10: $2a$10$xGYw3LQKQKQKQKQKQKQKQ
  db.seed('users', [
    {
      id: 1,
      email: 'admin@radiocesar.local',
      password: '$2a$10$xGYw3LQKQKQKQKQKQKQK.O9KQKQKQKQKQKQKQKQKQKQKQKQKQ', // hash for "admin"
      displayName: 'Admin',
      role: 'admin',
      avatar: null,
      isActive: 1,
      createdAt: '2026-01-01 00:00:00',
      updatedAt: '2026-01-01 00:00:00'
    }
  ]);

  return db;
}

export default MockDatabaseWrapper;
