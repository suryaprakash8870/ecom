import { NextResponse } from 'next/server';
import { query } from '../../../lib/database';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const offset = (page - 1) * limit;

    // Treat NULL as active for legacy rows
    let whereClause = 'WHERE COALESCE(p.is_active, true) = true';
    let queryParams = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      whereClause += ` AND p.category_id = $${paramCount}`;
      queryParams.push(category);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Get products with pagination
    const productsQuery = `
      SELECT p.*, c.name as category_name, u.name as seller_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const productsResult = await query(productsQuery, queryParams);
    // Normalize JSON fields
    const normalized = productsResult.rows.map((p) => {
      let images = [];
      let specifications = {};
      try { images = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'); } catch (_) { images = []; }
      try { specifications = typeof p.specifications === 'object' && p.specifications !== null ? p.specifications : JSON.parse(p.specifications || '{}'); } catch (_) { specifications = {}; }
      return { ...p, images, specifications };
    });

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      products: normalized,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, description, price, discount_price, category_id, stock_quantity, images, specifications } = await request.json();

    // Validate required fields
    if (!name || !price || !category_id) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    // Create product
    const result = await query(
      `INSERT INTO products (name, description, price, discount_price, category_id, stock_quantity, images, specifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, price, discount_price, category_id, stock_quantity, JSON.stringify(images || []), JSON.stringify(specifications || {})]
    );

    return NextResponse.json({
      message: 'Product created successfully',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
