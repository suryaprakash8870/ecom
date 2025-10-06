'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '../../../../components/AdminLayout';
import ImageUpload from '../../../../components/ImageUpload';
import toast from 'react-hot-toast';

export default function AdminProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', discount_price: '', category_id: '', stock_quantity: '', images: [], specifications: {}, is_active: true, tag: '' });

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
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch('/api/categories')
      ]);
      const prod = await prodRes.json();
      const cats = await catRes.json();
      setCategories(cats.categories || []);
      const p = prod.product;
      setForm({
        name: p.name || '',
        description: p.description || '',
        price: p.price || '',
        discount_price: p.discount_price || '',
        category_id: p.category_id || '',
        stock_quantity: p.stock_quantity || '',
        images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
        specifications: p.specifications || {},
        is_active: p.is_active !== false,
        tag: p.tag || ''
      });
    } catch (_) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          discount_price: form.discount_price ? Number(form.discount_price) : null,
          category_id: Number(form.category_id),
          stock_quantity: Number(form.stock_quantity),
          images: form.images || [],
          is_active: form.is_active !== false,
        })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Failed to save');
      toast.success('Saved');
      router.push('/admin/products');
    } catch (_) {
      toast.error('Failed to save');
    }
  };

  if (loading) return <AdminLayout title="Edit Product"><div className="text-gray-500">Loading...</div></AdminLayout>;

  return (
    <AdminLayout title={`Edit: ${form.name || ''}`}>
      <form onSubmit={save} className="bg-white rounded-lg border border-gray-200 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="label">Product Name *</label>
            <input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Price (₹) *</label>
              <input type="number" className="input-field" min="0" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="label">Discount Price (₹)</label>
              <input type="number" className="input-field" min="0" step="0.01" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} />
            </div>
            <div>
              <label className="label">Stock Quantity *</label>
              <input type="number" className="input-field" min="0" required value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Category *</label>
            <select className="input-field" required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Select</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <label className="text-sm text-gray-700">Visible (Active)</label>
          </div>
        </div>
        <div className="space-y-4">
          <label className="label">Images</label>
          <ImageUpload images={form.images} onImagesChange={(images) => setForm({ ...form, images })} maxImages={8} />
          <div>
            <label className="label">Specifications (JSON)</label>
            <textarea className="input-field" rows={8} value={JSON.stringify(form.specifications || {}, null, 2)} onChange={(e) => {
              try { setForm({ ...form, specifications: JSON.parse(e.target.value || '{}') }); } catch { /* ignore */ }
            }} />
          </div>
        </div>
        <div className="lg:col-span-2 flex justify-end">
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </AdminLayout>
  );
}


