import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/database';
import { requireAuth } from '../../../../../lib/auth';

export async function POST(request, { params }) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const reviewId = Number(params.id);
    // insert vote if not exists
    await query(`INSERT INTO review_votes (review_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [reviewId, user.id]);
    // update helpful count
    await query(`UPDATE product_reviews SET helpful_count = (SELECT COUNT(*) FROM review_votes WHERE review_id=$1) WHERE id=$1`, [reviewId]);
    return NextResponse.json({ message: 'Voted helpful' });
  } catch (e) {
    console.error('Helpful vote error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


