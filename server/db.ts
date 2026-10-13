import pg from 'pg';
export interface Database {
  query: (sql: string, values?: any[]) => Promise<{ rows: any[] }>;
  transaction?: <T>(work: (db: Database) => Promise<T>) => Promise<T>;
}
let pool: pg.Pool | undefined;
export function database(): Database {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_NOT_CONFIGURED');
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3, idleTimeoutMillis: 5000, connectionTimeoutMillis: 8000,
      ...(process.env.DATABASE_CA_CERT ? { ssl: { ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n'), rejectUnauthorized: true } } : {}),
    });
    pool.on('error', () => console.error('Database connection unavailable'));
  }
  const activePool = pool;
  return {
    query: (sql, values) => activePool.query(sql, values),
    transaction: async work => {
      const client = await activePool.connect();
      try {
        await client.query('BEGIN');
        const result = await work({ query: (sql, values) => client.query(sql, values) });
        await client.query('COMMIT');
        return result;
      } catch (error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
    },
  };
}
export async function closeDatabase() { await pool?.end(); pool = undefined; }
