import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';
import { requireAuth, ensureAdmin } from '../../../../lib/auth';

export async function PUT(request, { params }) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const adminCheck = ensureAdmin(user);
    if (adminCheck.response) return adminCheck.response;

    const id = Number(params.id);
    const { customer_name, title, body, media_url, rating, is_approved, is_featured } = await request.json();
    const res = await query(
      `UPDATE testimonials SET customer_name=$1, title=$2, body=$3, media_url=$4, rating=$5, is_approved=$6, is_featured=$7
       WHERE id=$8 RETURNING id`,
      [customer_name, title, body, media_url, rating, is_approved, is_featured, id]
    );
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Updated' });
  } catch (e) {
    console.error('Testimonials PUT error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const adminCheck = ensureAdmin(user);
    if (adminCheck.response) return adminCheck.response;

    const id = Number(params.id);
    const res = await query('DELETE FROM testimonials WHERE id=$1 RETURNING id', [id]);
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' });
  } catch (e) {
    console.error('Testimonials DELETE error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


