import { NextResponse } from 'next/server';
import { query } from '../../../lib/database';
import { requireAuth, ensureAdmin } from '../../../lib/auth';

export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM categories ORDER BY name ASC'
    );

    return NextResponse.json({
      categories: result.rows
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const adminCheck = ensureAdmin(user);
    if (adminCheck.response) return adminCheck.response;

    const { name, description, image_url, parent_id } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Create category
    const result = await query(
      `INSERT INTO categories (name, description, image_url, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, image_url, parent_id]
    );

    return NextResponse.json({
      message: 'Category created successfully',
      category: result.rows[0]
    });

  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
