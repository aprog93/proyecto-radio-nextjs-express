import type { Database as SqlJsDatabase } from 'sql.js';

/**
 * Wrapper para sql.js que proporciona una API similar a better-sqlite3
 */
export class DatabaseWrapper {
  constructor(private db: SqlJsDatabase) {}

  /**
   * Ejecuta una consulta SELECT y retorna la primera fila
   */
  getOne<T = any>(sql: string, params: any[] = []): T | undefined {
    try {
      const results = this.db.exec(sql, params);
      if (!results || results.length === 0 || results[0].values.length === 0) {
        return undefined;
      }
      return this._rowToObject<T>(results[0].columns, results[0].values[0]);
    } catch (error) {
      console.error('Database error in getOne:', error);
      throw error;
    }
  }

  /**
   * Ejecuta una consulta SELECT y retorna todas las filas
   */
  getAll<T = any>(sql: string, params: any[] = []): T[] {
    try {
      const results = this.db.exec(sql, params);
      if (!results || results.length === 0 || results[0].values.length === 0) {
        return [];
      }
      return results[0].values.map((row) =>
        this._rowToObject<T>(results[0].columns, row)
      );
    } catch (error) {
      console.error('Database error in getAll:', error);
      throw error;
    }
  }

  /**
   * Ejecuta una consulta INSERT/UPDATE/DELETE
   */
  run(sql: string, params: any[] = []): { changes: number; lastID: number } {
    try {
      this.db.run(sql, params);
      const changes = this.db.getRowsModified();
      // sql.js no proporciona lastID directamente, usar SELECT last_insert_rowid()
      const lastIdResult = this.db.exec('SELECT last_insert_rowid() as id');
      const lastID =
        lastIdResult && lastIdResult[0]?.values[0]
          ? (lastIdResult[0].values[0][0] as number)
          : 0;
      return { changes, lastID };
    } catch (error) {
      console.error('Database error in run:', { sql, params, error });
      throw error;
    }
  }

  /**
   * Cuenta el número de filas que coinciden con la consulta
   */
  count(sql: string, params: any[] = []): number {
    const modifiedSql = `SELECT COUNT(*) as count FROM (${sql.replace(
      /^SELECT\s+.*?\s+FROM/i,
      'SELECT 1 FROM'
    )})`;
    const result = this.getOne<{ count: number }>(modifiedSql, params);
    return result?.count || 0;
  }

  /**
   * Inicia una transacción
   */
  transaction<T>(callback: () => T): T {
    try {
      this.db.run('BEGIN TRANSACTION');
      const result = callback();
      this.db.run('COMMIT');
      return result;
    } catch (error) {
      this.db.run('ROLLBACK');
      throw error;
    }
  }

  /**
   * Convierte una fila de sql.js a un objeto
   */
  private _rowToObject<T = any>(columns: string[], row: any[]): T {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as T;
  }
}
