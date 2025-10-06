'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '../../../../components/AdminLayout';
import { CheckCircle, Clock, Truck, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) return router.push('/login');
    const u = JSON.parse(user);
    if (u.role !== 'admin') return router.push('/');
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?id=${id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Failed to load order');
      setOrder((data.orders || [])[0] || null);
    } catch (_) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLayout title="Order Detail"><div className="text-gray-500">Loading...</div></AdminLayout>;
  if (!order) return <AdminLayout title="Order Detail"><div className="text-gray-500">Order not found.</div></AdminLayout>;

  return (
    <AdminLayout title={`Order #${order.order_number}`} subtitle={`${order.customer_name} • ₹${Number(order.total_amount).toLocaleString('en-IN')}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Items</h2>
          <div className="space-y-3">
            {(order.items || []).map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                    {it.images && it.images[0] ? <img src={it.images[0]} alt={it.product_name} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{it.product_name}</div>
                    <div className="text-gray-600">Qty: {it.quantity}</div>
                  </div>
                </div>
                <div className="font-medium">₹{Number(it.price * it.quantity).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Placed: {new Date(order.created_at).toLocaleString('en-IN')}</div>
              <div className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment: {order.payment_method}</div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Status: <span className="capitalize">{order.status}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <div className="text-sm text-gray-700">
              <div>{order.customer_name}</div>
              <div>{order.customer_email}</div>
              <div className="mt-2 whitespace-pre-line">{order.shipping_address}</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


