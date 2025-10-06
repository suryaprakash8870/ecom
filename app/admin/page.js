'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Package, Users, ShoppingCart, TrendingUp, Eye, Edit } from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0
  });
  const [dashboard, setDashboard] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    setUser(user);
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      // Fetch recent orders
      const ordersResponse = await fetch('/api/admin/orders?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);
        setStats(prev => ({
          ...prev,
          totalOrders: ordersData.pagination?.total || 0
        }));
      }

      // Fetch aggregated stats
      const statsRes = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } });
      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(prev => ({
          ...prev,
          totalUsers: s.users || 0,
          totalProducts: s.products || 0,
          totalRevenue: Number(s.revenue) || 0
        }));
      }

      // Dashboard insights
      const dashRes = await fetch('/api/admin/dashboard', { headers: { 'Authorization': `Bearer ${token}` } });
      if (dashRes.ok) {
        setDashboard(await dashRes.json());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: orderId,
          status: status
        })
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Manage your e-commerce platform">

        {/* Layout: Sidebar + Main */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Quick Actions */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
              <nav className="space-y-2">
                <button onClick={() => router.push('/admin/orders')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50">Manage Orders</button>
                <button onClick={() => router.push('/admin/products')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50">Manage Products</button>
                <button onClick={() => router.push('/admin/users')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50">Manage Users</button>
                <button onClick={() => router.push('/admin/categories')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50">Manage Categories</button>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
            </div>

            {/* New dashboard sections */}
            {dashboard && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Sales, Orders by Status, Best Sellers, Low Stock, Revenue by Method, Traffic */}
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-sm text-gray-500">Today</div>
                      <div className="text-xl font-bold">₹{Number(dashboard.sales.today).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-sm text-gray-500">7 Days</div>
                      <div className="text-xl font-bold">₹{Number(dashboard.sales.week).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-sm text-gray-500">This Month</div>
                      <div className="text-xl font-bold">₹{Number(dashboard.sales.month).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dashboard.ordersByStatus.map((o) => (
                      <div key={o.status} className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-sm capitalize text-gray-500">{o.status}</div>
                        <div className="text-xl font-bold">{o.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Best Sellers</h2>
                  <div className="space-y-2">
                    {dashboard.bestSellers.length === 0 && <div className="text-gray-500">No data yet.</div>}
                    {dashboard.bestSellers.map((p) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <div className="truncate pr-3">{p.name}</div>
                        <div className="text-sm text-gray-600">{p.units} sold</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h2>
                  <div className="space-y-2">
                    {dashboard.lowStock.length === 0 && <div className="text-gray-500">All good.</div>}
                    {dashboard.lowStock.map((p) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <div className="truncate pr-3">{p.name}</div>
                        <div className="text-sm text-red-600">{p.stock_quantity} left</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Payment Method</h2>
                  <div className="space-y-2">
                    {dashboard.paymentRevenue.map((r) => (
                      <div key={r.method} className="flex items-center justify-between">
                        <div className="capitalize">{r.method}</div>
                        <div className="font-medium">₹{Number(r.revenue).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Traffic Summary</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-sm text-gray-500">Visitors</div>
                      <div className="text-xl font-bold">{dashboard.traffic.visitors}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-sm text-gray-500">Unique Users</div>
                      <div className="text-xl font-bold">{dashboard.traffic.uniqueUsers}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-sm text-gray-500">Bounce Rate</div>
                      <div className="text-xl font-bold">{dashboard.traffic.bounceRate}%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              </div>
              <div className="p-6">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">#{order.order_number}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                          <p className="text-sm font-medium text-gray-900">{formatPrice(order.total_amount)}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-sm border border-neutral-300 rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No orders found</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* New dashboard sections */}
        {dashboard && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Today</div>
                  <div className="text-xl font-bold">₹{Number(dashboard.sales.today).toLocaleString('en-IN')}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-500">7 Days</div>
                  <div className="text-xl font-bold">₹{Number(dashboard.sales.week).toLocaleString('en-IN')}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-500">This Month</div>
                  <div className="text-xl font-bold">₹{Number(dashboard.sales.month).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dashboard.ordersByStatus.map((o) => (
                  <div key={o.status} className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-sm capitalize text-gray-500">{o.status}</div>
                    <div className="text-xl font-bold">{o.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Best Sellers</h2>
              <div className="space-y-2">
                {dashboard.bestSellers.length === 0 && <div className="text-gray-500">No data yet.</div>}
                {dashboard.bestSellers.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="truncate pr-3">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.units} sold</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h2>
              <div className="space-y-2">
                {dashboard.lowStock.length === 0 && <div className="text-gray-500">All good.</div>}
                {dashboard.lowStock.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="truncate pr-3">{p.name}</div>
                    <div className="text-sm text-red-600">{p.stock_quantity} left</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Payment Method</h2>
              <div className="space-y-2">
                {dashboard.paymentRevenue.map((r) => (
                  <div key={r.method} className="flex items-center justify-between">
                    <div className="capitalize">{r.method}</div>
                    <div className="font-medium">₹{Number(r.revenue).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Traffic Summary</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Visitors</div>
                  <div className="text-xl font-bold">{dashboard.traffic.visitors}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Unique Users</div>
                  <div className="text-xl font-bold">{dashboard.traffic.uniqueUsers}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Bounce Rate</div>
                  <div className="text-xl font-bold">{dashboard.traffic.bounceRate}%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <div className="p-6">
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">#{order.order_number}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                        <p className="text-sm font-medium text-gray-900">{formatPrice(order.total_amount)}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No orders found</p>
              )}
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}
