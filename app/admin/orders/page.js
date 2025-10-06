'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) return router.push('/login');
    const u = JSON.parse(user);
    if (u.role !== 'admin') return router.push('/');
    load();
  }, [router, statusFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Failed to load orders');
      setOrders(data.orders || []);
    } catch (_) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (id, status) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ order_id: id, status })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Update failed');
      toast.success('Order status updated');
      load();
    } catch (_) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <AdminLayout title="Manage Orders">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
          <select className="input-field max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-4">
          {orders.length === 0 && <p className="text-gray-500">No orders found.</p>}
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-neutral-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-gray-900">#{o.order_number}</div>
                  <div className="text-sm text-gray-600">{o.customer_name} • {new Date(o.created_at).toLocaleString('en-IN')}</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">₹{Number(o.total_amount).toLocaleString('en-IN')}</div>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center gap-3">
                  <select className="input-field" value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              {o.items && o.items.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                        {it.images && it.images.length > 0 ? <img src={it.images[0]} alt={it.product_name} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div className="flex-1 truncate">{it.product_name} × {it.quantity}</div>
                      <div>₹{Number(it.price * it.quantity).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}


