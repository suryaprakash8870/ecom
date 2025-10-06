import { NextResponse } from 'next/server';
import { query } from '../../../lib/database';
import { requireAuth } from '../../../lib/auth';

export async function GET(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const userId = user.id;

    const result = await query(
      `SELECT c.*, p.name as product_name, p.price, p.discount_price, p.images, p.stock_quantity
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );

    const cart = result.rows.map((row) => {
      let images = [];
      try { images = Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'); } catch (_) { images = []; }
      return { ...row, images };
    });

    const summary = {
      count: cart.reduce((sum, item) => sum + (item.quantity || 0), 0),
      uniqueItems: cart.length,
    };

    return NextResponse.json({
      cart,
      summary,
    });

  } catch (error) {
    console.error('Cart fetch error:', error);
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

    const { product_id, quantity } = await request.json();
    const userId = user.id;

    // Validate required fields
    if (!product_id || !quantity) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existingItem = await query(
      'SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    if (existingItem.rows.length > 0) {
      // Update existing item quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;
      await query(
        'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQuantity, existingItem.rows[0].id]
      );
    } else {
      // Add new item to cart
      await query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [userId, product_id, quantity]
      );
    }

    return NextResponse.json({
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
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

    const { product_id, quantity } = await request.json();
    const userId = user.id;

    if (quantity <= 0) {
      // Remove item from cart
      await query(
        'DELETE FROM cart WHERE user_id = $1 AND product_id = $2',
        [userId, product_id]
      );
    } else {
      // Update quantity
      await query(
        'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3',
        [quantity, userId, product_id]
      );
    }

    return NextResponse.json({
      message: 'Cart updated successfully'
    });

  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');
    const userId = user.id;

    if (product_id) {
      // Remove specific item
      await query(
        'DELETE FROM cart WHERE user_id = $1 AND product_id = $2',
        [userId, product_id]
      );
    } else {
      // Clear entire cart
      await query(
        'DELETE FROM cart WHERE user_id = $1',
        [userId]
      );
    }

    return NextResponse.json({
      message: 'Item(s) removed from cart successfully'
    });

  } catch (error) {
    console.error('Cart delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
