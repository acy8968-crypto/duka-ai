/**
 * db.js
 * ------------------------------------------------------------------
 * Shared PostgreSQL connection pool, used by all the *Store.js modules.
 * Reads connection details from DATABASE_URL in .env.
 * ------------------------------------------------------------------
 */

const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "WARNING: DATABASE_URL is not set in .env - database calls will fail until it's configured."
  );
}

const pool = new Pool({ connectionString });

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
});

module.exports = { pool };
