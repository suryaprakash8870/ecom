import { NextResponse } from 'next/server';
import { query } from '../../../lib/database';
import { requireAuth, ensureAdmin } from '../../../lib/auth';

// Public list (approved only, featured first)
export async function GET() {
  try {
    const res = await query(
      `SELECT id, customer_name, title, body, media_url, rating
       FROM testimonials WHERE is_approved = true
       ORDER BY is_featured DESC, created_at DESC LIMIT 20`
    );
    return NextResponse.json({ testimonials: res.rows });
  } catch (e) {
    console.error('Testimonials GET error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Admin create
export async function POST(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const adminCheck = ensureAdmin(user);
    if (adminCheck.response) return adminCheck.response;

    const { customer_name, title, body, media_url, rating, is_approved, is_featured } = await request.json();
    if (!customer_name || !body) return NextResponse.json({ error: 'customer_name and body required' }, { status: 400 });
    await query(
      `INSERT INTO testimonials (customer_name, title, body, media_url, rating, is_approved, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [customer_name, title || null, body, media_url || null, rating || null, !!is_approved, !!is_featured]
    );
    return NextResponse.json({ message: 'Created' });
  } catch (e) {
    console.error('Testimonials POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


