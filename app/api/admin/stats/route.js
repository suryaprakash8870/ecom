import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';
import { requireAuth, ensureAdmin } from '../../../../lib/auth';

export async function GET(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const adminCheck = ensureAdmin(user);
    if (adminCheck.response) return adminCheck.response;

    const usersQ = query('SELECT COUNT(*)::int AS total FROM users');
    const productsQ = query('SELECT COUNT(*)::int AS total FROM products');
    const revenueQ = query("SELECT COALESCE(SUM(total_amount),0)::numeric AS total FROM orders WHERE payment_status = 'paid' OR status IN ('confirmed','shipped','delivered')");

    const [usersR, productsR, revenueR] = await Promise.all([usersQ, productsQ, revenueQ]);

    return NextResponse.json({
      users: usersR.rows[0].total,
      products: productsR.rows[0].total,
      revenue: revenueR.rows[0].total,
    });
  } catch (e) {
    console.error('Admin stats error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


