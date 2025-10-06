import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/database';
import { requireAuth } from '../../../../../lib/auth';

export async function GET(request, { params }) {
  try {
    const productId = Number(params.id);
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'recent';
    const order = sort === 'helpful' ? 'r.helpful_count DESC, r.created_at DESC' : 'r.created_at DESC';
    const res = await query(
      `SELECT r.id, r.rating, r.title, r.body, r.created_at, r.helpful_count, u.name as user_name
       FROM product_reviews r LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 ORDER BY ${order}`,
      [productId]
    );
    return NextResponse.json({ reviews: res.rows });
  } catch (e) {
    console.error('Reviews GET error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const productId = Number(params.id);
    const { rating, title, body, media_urls } = await request.json();
    if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'rating 1-5 required' }, { status: 400 });
    await query(
      `INSERT INTO product_reviews (product_id, user_id, rating, title, body, media_urls) VALUES ($1, $2, $3, $4, $5, $6)`,
      [productId, user.id, rating, title || null, body || null, JSON.stringify(media_urls || [])]
    );
    return NextResponse.json({ message: 'Review added' });
  } catch (e) {
    console.error('Reviews POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


