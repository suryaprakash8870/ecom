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
    const { name, description, image_url, parent_id } = await request.json();

    if (!id || !name) {
      return NextResponse.json({ error: 'Category id and name are required' }, { status: 400 });
    }

    const result = await query(
      `UPDATE categories
       SET name = $1, description = $2, image_url = $3, parent_id = $4
       WHERE id = $5
       RETURNING *`,
      [name, description, image_url, parent_id || null, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category updated', category: result.rows[0] });
  } catch (error) {
    console.error('Category update error:', error);
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
    if (!id) {
      return NextResponse.json({ error: 'Category id is required' }, { status: 400 });
    }

    // Prevent delete if referenced by products (optional safe-guard)
    const inUse = await query('SELECT 1 FROM products WHERE category_id = $1 LIMIT 1', [id]);
    if (inUse.rows.length) {
      return NextResponse.json({ error: 'Category in use by products. Move products first.' }, { status: 409 });
    }

    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Category delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


