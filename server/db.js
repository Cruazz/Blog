import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

// Strip sslmode from connection string to avoid pg warning, handle SSL via config
const connectionString = process.env.DATABASE_URL?.replace(/&?sslmode=[^&]+/g, "").replace(/\?sslmode=[^&]+/, "");

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes("neon") ? { rejectUnauthorized: false } : false,
});

export default pool;