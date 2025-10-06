import { NextResponse } from 'next/server';
import { query } from '../../../lib/database';
import { requireAuth } from '../../../lib/auth';

export async function GET(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const result = await query(
      `SELECT w.product_id, p.name, p.price, p.discount_price, p.images
       FROM wishlist w JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [user.id]
    );
    const items = result.rows.map((p) => ({
      ...p,
      images: (() => { try { return Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'); } catch { return []; } })()
    }));
    return NextResponse.json({ items });
  } catch (e) {
    console.error('Wishlist GET error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const { product_id } = await request.json();
    if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 });
    await query(
      `INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [user.id, product_id]
    );
    return NextResponse.json({ message: 'Added to wishlist' });
  } catch (e) {
    console.error('Wishlist POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');
    if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 });
    await query(`DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2`, [user.id, product_id]);
    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (e) {
    console.error('Wishlist DELETE error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


