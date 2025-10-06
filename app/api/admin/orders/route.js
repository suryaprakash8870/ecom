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
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause = `WHERE o.status = $${paramCount}`;
      queryParams.push(status);
    }

    // Get orders with pagination
    const ordersQuery = `
      SELECT o.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const orders = await query(ordersQuery, queryParams);

    // Get order items for each order
    for (let order of orders.rows) {
      const itemsQuery = `
        SELECT oi.*, p.name as product_name, p.images
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `;
      const items = await query(itemsQuery, [order.id]);
      order.items = items.rows;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM orders o ${whereClause}`;
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      orders: orders.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin orders fetch error:', error);
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

    const { order_id, status } = await request.json();

    if (!order_id || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Update order status
    const result = await query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, order_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });

  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
