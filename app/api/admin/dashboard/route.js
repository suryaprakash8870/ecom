import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';
import { requireAuth, ensureAdmin } from '../../../../lib/auth';

export async function GET(request) {
  try {
    const { user, response } = requireAuth(request);
    if (response) return response;
    const adminCheck = ensureAdmin(user);
    if (adminCheck.response) return adminCheck.response;

    // Time ranges
    const salesTodayQ = query(`SELECT COALESCE(SUM(total_amount),0)::numeric AS total FROM orders WHERE created_at::date = CURRENT_DATE AND (payment_status='paid' OR status IN ('confirmed','shipped','delivered'))`);
    const salesWeekQ = query(`SELECT COALESCE(SUM(total_amount),0)::numeric AS total FROM orders WHERE created_at >= (CURRENT_DATE - INTERVAL '7 days') AND (payment_status='paid' OR status IN ('confirmed','shipped','delivered'))`);
    const salesMonthQ = query(`SELECT COALESCE(SUM(total_amount),0)::numeric AS total FROM orders WHERE date_trunc('month',created_at)=date_trunc('month',CURRENT_DATE) AND (payment_status='paid' OR status IN ('confirmed','shipped','delivered'))`);

    const ordersByStatusQ = query(`
      SELECT status, COUNT(*)::int AS count
      FROM orders GROUP BY status
    `);

    const bestSellersQ = query(`
      SELECT p.id, p.name, SUM(oi.quantity)::int AS units, SUM(oi.quantity*oi.price)::numeric AS revenue
      FROM order_items oi JOIN products p ON p.id = oi.product_id
      GROUP BY p.id, p.name
      ORDER BY units DESC
      LIMIT 5
    `);

    const lowStockQ = query(`
      SELECT id, name, stock_quantity
      FROM products
      WHERE stock_quantity < 10
      ORDER BY stock_quantity ASC
      LIMIT 10
    `);

    const paymentRevenueQ = query(`
      SELECT COALESCE(payment_method,'unknown') AS method, COALESCE(SUM(total_amount),0)::numeric AS revenue
      FROM orders
      WHERE (payment_status='paid' OR status IN ('confirmed','shipped','delivered'))
      GROUP BY payment_method
    `);

    const [todayR, weekR, monthR, statusR, bestR, lowR, payR] = await Promise.all([
      salesTodayQ, salesWeekQ, salesMonthQ, ordersByStatusQ, bestSellersQ, lowStockQ, paymentRevenueQ
    ]);

    // Traffic placeholders (no tracker connected)
    const traffic = { visitors: 0, uniqueUsers: 0, bounceRate: 0 };

    return NextResponse.json({
      sales: {
        today: Number(todayR.rows[0].total || 0),
        week: Number(weekR.rows[0].total || 0),
        month: Number(monthR.rows[0].total || 0),
      },
      ordersByStatus: statusR.rows,
      bestSellers: bestR.rows,
      lowStock: lowR.rows,
      paymentRevenue: payR.rows,
      traffic,
    });
  } catch (e) {
    console.error('Admin dashboard error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


