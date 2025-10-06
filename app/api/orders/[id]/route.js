import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';
import { authenticateToken } from '../../../../lib/auth';

export async function GET(request, { params }) {
  try {
    const authResult = await authenticateToken(request);
    if (authResult) return authResult;

    const orderId = params.id;
    const userId = request.user.id;

    // Get order details
    const orderQuery = `
      SELECT o.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1 AND o.user_id = $2
    `;

    const orderResult = await query(orderQuery, [orderId, userId]);

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    // Parse shipping address
    if (order.shipping_address) {
      try {
        order.shipping_address = JSON.parse(order.shipping_address);
      } catch (e) {
        order.shipping_address = {};
      }
    }

    // Get order items
    const itemsQuery = `
      SELECT oi.*, p.name as product_name, p.images
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;

    const itemsResult = await query(itemsQuery, [orderId]);
    
    // Parse images for each item
    const items = itemsResult.rows.map(item => {
      if (item.images) {
        try {
          item.images = JSON.parse(item.images);
        } catch (e) {
          item.images = [];
        }
      } else {
        item.images = [];
      }
      return item;
    });

    order.items = items;

    return NextResponse.json({
      order
    });

  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
