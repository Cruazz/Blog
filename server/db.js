import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

// Strip sslmode from connection string to avoid pg warning, handle SSL via config
const databaseUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
const sslMode = databaseUrl?.searchParams.get('sslmode');
databaseUrl?.searchParams.delete('sslmode');
const connectionString = databaseUrl?.toString();

const pool = new Pool({
  connectionString,
  ssl: databaseUrl?.hostname.endsWith('.neon.tech') || ['require', 'verify-ca', 'verify-full'].includes(sslMode)
    ? { rejectUnauthorized: true } : undefined,
});

export default pool;
