import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';

export async function GET(request, { params }) {
  try {
    const productId = params.id;

    // Get product details with category and seller information
    const productQuery = `
      SELECT p.*, c.name as category_name, u.name as seller_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.id = $1 AND COALESCE(p.is_active, true) = true
    `;

    const result = await query(productQuery, [productId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = result.rows[0];

    // Normalize JSON fields that may be stored as text
    try {
      product.images = Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]');
    } catch (_) { product.images = []; }
    try {
      product.specifications = typeof product.specifications === 'object' && product.specifications !== null
        ? product.specifications
        : JSON.parse(product.specifications || '{}');
    } catch (_) { product.specifications = {}; }

    return NextResponse.json({
      product
    });

  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const productId = params.id;
    const { name, description, price, discount_price, category_id, stock_quantity, images, specifications, is_active } = await request.json();

    // Update product
    const result = await query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, discount_price = $4, 
           category_id = $5, stock_quantity = $6, images = $7, 
           specifications = $8, is_active = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        name, description, price, discount_price, category_id, 
        stock_quantity, JSON.stringify(images || []), 
        JSON.stringify(specifications || {}), is_active, productId
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const productId = params.id;

    // Soft delete by setting is_active to false
    const result = await query(
      'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [productId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
