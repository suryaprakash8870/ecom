'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import toast from 'react-hot-toast';

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ customer_name: '', title: '', body: '', media_url: '', rating: '', is_approved: true, is_featured: false });

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!user || !token) return (window.location.href = '/login');
    const u = JSON.parse(user);
    if (u.role !== 'admin') return (window.location.href = '/');
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Failed to load');
      setItems(data.testimonials || []);
    } catch (_) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          customer_name: form.customer_name,
          title: form.title || null,
          body: form.body,
          media_url: form.media_url || null,
          rating: form.rating ? Number(form.rating) : null,
          is_approved: !!form.is_approved,
          is_featured: !!form.is_featured,
        })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Failed to save');
      toast.success('Saved');
      setForm({ customer_name: '', title: '', body: '', media_url: '', rating: '', is_approved: true, is_featured: false });
      load();
    } catch (_) {
      toast.error('Failed to save');
    }
  };

  return (
    <AdminLayout title="Manage Testimonials" subtitle="Create and feature customer testimonials">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Existing Testimonials</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-gray-500">No testimonials yet.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {items.map((t) => (
                <li key={t.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-gray-900">{t.customer_name}</div>
                    {t.title && <div className="text-sm text-gray-700">{t.title}</div>}
                    <div className="text-sm text-gray-600 line-clamp-2">{t.body}</div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {t.rating ? `★ ${t.rating}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Create Testimonial</h2>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label">Customer Name *</label>
              <input className="input-field" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Title</label>
              <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Body *</label>
              <textarea className="input-field" rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
            </div>
            <div>
              <label className="label">Media URL</label>
              <input className="input-field" value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="label">Rating</label>
              <input type="number" className="input-field" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="1-5" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.is_approved} onChange={(e) => setForm({ ...form, is_approved: e.target.checked })} />
                Approved
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                Featured
              </label>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}


