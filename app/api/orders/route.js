import { NextResponse } from 'next/server';
import { query } from '../../../lib/database';
import { requireAuth } from '../../../lib/auth';
import { sendOrderEmail } from '../../../lib/mailer';
import { getWhatsAppService } from '../../../lib/whatsapp';

export async function GET(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    // Get orders with pagination
    const ordersQuery = `
      SELECT o.*, u.name as customer_name, u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const orders = await query(ordersQuery, [userId, limit, offset]);

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
    const countResult = await query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
      [userId]
    );
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
    console.error('Orders fetch error:', error);
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

    const { shipping_address, payment_method } = await request.json();
    const userId = user.id;

    // Validate required fields
    if (!shipping_address) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Get cart items
    const cartQuery = `
      SELECT c.*, p.name, p.price, p.discount_price, p.stock_quantity
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `;
    const cartItems = await query(cartQuery, [userId]);

    if (cartItems.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Check stock availability
    for (let item of cartItems.rows) {
      if (item.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.name}. Available: ${item.stock_quantity}` },
          { status: 400 }
        );
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate total amount
    let totalAmount = 0;
    for (let item of cartItems.rows) {
      const price = item.discount_price || item.price;
      totalAmount += price * item.quantity;
    }

    // Create order
    const orderResult = await query(
      `INSERT INTO orders (user_id, order_number, total_amount, payment_method, shipping_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, orderNumber, totalAmount, payment_method, JSON.stringify(shipping_address)]
    );

    const order = orderResult.rows[0];

    // Create order items and update stock
    for (let item of cartItems.rows) {
      const price = item.discount_price || item.price;
      
      await query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, price]
      );

      // Update stock
      await query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await query('DELETE FROM cart WHERE user_id = $1', [userId]);

    // Get customer details for notification
    const customerResult = await query(
      'SELECT name, phone FROM users WHERE id = $1',
      [userId]
    );
    const customer = customerResult.rows[0];

    // Send WhatsApp notification
    try {
      const whatsappService = getWhatsAppService();
      await whatsappService.sendOrderNotification({
        order,
        customer,
        items: cartItems.rows.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.discount_price || item.price
        }))
      }, process.env.ADMIN_WHATSAPP_NUMBER);
    } catch (whatsappError) {
      console.error('WhatsApp notification failed:', whatsappError);
      // Don't fail the order if WhatsApp fails
    }

    // Email receipt (best-effort)
    try {
      const customerEmailRes = await query('SELECT email, name FROM users WHERE id=$1', [userId]);
      const { email: to, name: customerName } = customerEmailRes.rows[0] || {};
      await sendOrderEmail({ to, customerName, order: {
        ...order,
        items: cartItems.rows.map(item => ({ product_name: item.name, quantity: item.quantity, price: item.discount_price || item.price }))
      }});
    } catch (e) {
      console.error('Order email failed:', e);
    }

    return NextResponse.json({
      message: 'Order placed successfully',
      order: {
        ...order,
        items: cartItems.rows.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.discount_price || item.price
        }))
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
