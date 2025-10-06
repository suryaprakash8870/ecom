import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
import { query } from '../../../lib/database';
import { requireAuth } from '../../../lib/auth';

export async function GET(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;

    const userId = user.id;

    const result = await query(
      'SELECT id, name, email, phone, address, city, state, pincode, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;

    const { name, phone, address, city, state, pincode } = await request.json();
    const userId = user.id;

    // Update user profile
    const result = await query(
      `UPDATE users 
       SET name = $1, phone = $2, address = $3, city = $4, state = $5, pincode = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, name, email, phone, address, city, state, pincode, role, created_at`,
      [name, phone, address, city, state, pincode, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
