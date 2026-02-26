import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Database as SqlJsDatabase } from 'sql.js';
import { DatabaseWrapper } from '@/config/db-wrapper.js';

/**
 * Mock DatabaseWrapper for unit testing
 */
export class MockDatabaseWrapper {
  private data: Map<string, any[]> = new Map();

  /**
   * Simulates sql.js getOne behavior
   */
  getOne<T = any>(sql: string, params: any[] = []): T | undefined {
    const tableName = this._extractTableName(sql);
    const rows = this.data.get(tableName) || [];

    if (sql.includes('WHERE')) {
      // Simple WHERE clause handling for testing
      return rows[0] as T | undefined;
    }

    return rows[0] as T | undefined;
  }

  /**
   * Simulates sql.js getAll behavior
   */
  getAll<T = any>(sql: string, params: any[] = []): T[] {
    const tableName = this._extractTableName(sql);
    return (this.data.get(tableName) || []) as T[];
  }

  /**
   * Simulates sql.js run behavior (INSERT/UPDATE/DELETE)
   */
  run(sql: string, params: any[] = []): { changes: number; lastID: number } {
    const tableName = this._extractTableName(sql);
    const rows = this.data.get(tableName) || [];

    if (sql.includes('INSERT')) {
      const id = rows.length + 1;
      rows.push({ id, ...Object.fromEntries(
        sql.match(/VALUES/i) ? params.map((p, i) => [`field${i}`, p]) : []
      ) });
      this.data.set(tableName, rows);
      return { changes: 1, lastID: id };
    }

    if (sql.includes('UPDATE')) {
      return { changes: 1, lastID: 0 };
    }

    if (sql.includes('DELETE')) {
      return { changes: 1, lastID: 0 };
    }

    return { changes: 0, lastID: 0 };
  }

  /**
   * Simulates sql.js count behavior
   */
  count(sql: string, params: any[] = []): number {
    const tableName = this._extractTableName(sql);
    return (this.data.get(tableName) || []).length;
  }

  /**
   * Simulates transaction behavior
   */
  transaction<T>(callback: () => T): T {
    return callback();
  }

  /**
   * Set mock data for a table
   */
  setTableData(tableName: string, data: any[]): void {
    this.data.set(tableName, data);
  }

  /**
   * Get mock data for a table
   */
  getTableData(tableName: string): any[] {
    return this.data.get(tableName) || [];
  }

  /**
   * Clear all mock data
   */
  clear(): void {
    this.data.clear();
  }

  /**
   * Helper to extract table name from SQL
   */
  private _extractTableName(sql: string): string {
    const match = sql.match(/FROM\s+(\w+)|INTO\s+(\w+)|UPDATE\s+(\w+)/i);
    return match ? (match[1] || match[2] || match[3] || 'unknown').toLowerCase() : 'unknown';
  }
}

/**
 * Create a mock database with pre-populated tables
 */
export function createMockDatabase(): MockDatabaseWrapper {
  const db = new MockDatabaseWrapper();
  return db;
}

/**
 * Create a mock database with default test data
 */
export function createMockDatabaseWithTestData(testData: Record<string, any[]>): MockDatabaseWrapper {
  const db = new MockDatabaseWrapper();
  Object.entries(testData).forEach(([table, data]) => {
    db.setTableData(table, data);
  });
  return db;
}
