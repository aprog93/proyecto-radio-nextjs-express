declare module 'sql.js' {
  interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string, params?: any[]): Array<{ columns: string[]; values: any[][] }>;
    export(): Uint8Array;
    close(): void;
    getRowsModified(): number;
  }

  function initSqlJs(config?: any): Promise<{ Database: new (data?: Uint8Array) => Database }>;

  export default initSqlJs;
  export type { Database };
}
