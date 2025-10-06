import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';
import { authenticateToken, requireAdmin } from '../../../../lib/auth';

export async function GET(request) {
  try {
    const authResult = await authenticateToken(request);
    if (authResult) return authResult;

    const adminResult = await requireAdmin(request);
    if (adminResult) return adminResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const role = searchParams.get('role');
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      whereClause = `WHERE role = $${paramCount}`;
      queryParams.push(role);
    }

    // Get users with pagination
    const usersQuery = `
      SELECT id, name, email, phone, role, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const users = await query(usersQuery, queryParams);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      users: users.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const authResult = await authenticateToken(request);
    if (authResult) return authResult;

    const adminResult = await requireAdmin(request);
    if (adminResult) return adminResult;

    const { user_id, role } = await request.json();

    if (!user_id || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    // Update user role
    const result = await query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role',
      [role, user_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('User role update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
