const { Pool } = require('pg');

let pool;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Do not crash the serverless function; callers should handle missing env
    return null;
  }

  pool = new Pool({
    connectionString,
    // Enable SSL for hosted DBs; allow local without SSL
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
  });

  pool.on('error', (err) => {
    console.error('Database connection error:', err);
  });

  return pool;
}

async function query(text, params) {
  const p = getPool();
  if (!p) {
    const err = new Error('DATABASE_URL is not configured');
    err.code = 'NO_DATABASE_URL';
    throw err;
  }
  return p.query(text, params);
}

module.exports = { query, getPool };
