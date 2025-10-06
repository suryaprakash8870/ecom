import { NextResponse } from 'next/server';

export async function GET() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];
  const missing = required.filter((k) => !process.env[k]);
  // Try a lightweight DB ping if configured
  let db = 'skipped';
  if (process.env.DATABASE_URL) {
    try {
      const { query } = require('../../../lib/database');
      await query('SELECT 1');
      db = 'ok';
    } catch (e) {
      db = `error: ${e.code || e.message}`;
    }
  }
  return NextResponse.json({
    ok: missing.length === 0,
    missing,
    node: process.version,
    env: process.env.NODE_ENV,
    db,
  });
}


