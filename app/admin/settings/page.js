'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [form, setForm] = useState({ store_name: '', support_email: '', support_phone: '', primary_color: '' });

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!user || !token) return (window.location.href = '/login');
    const u = JSON.parse(user);
    if (u.role !== 'admin') return (window.location.href = '/');
  }, []);

  const save = async (e) => {
    e.preventDefault();
    // Placeholder: persist to backend if route exists; otherwise store locally
    try {
      localStorage.setItem('admin_settings', JSON.stringify(form));
      toast.success('Settings saved');
    } catch (_) {
      toast.error('Failed to save');
    }
  };

  return (
    <AdminLayout title="Settings" subtitle="Configure store information and theme">
      <form onSubmit={save} className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label">Store Name</label>
            <input className="input-field" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="CareQ" />
          </div>
          <div>
            <label className="label">Support Email</label>
            <input className="input-field" value={form.support_email} onChange={(e) => setForm({ ...form, support_email: e.target.value })} placeholder="support@example.com" />
          </div>
          <div>
            <label className="label">Support Phone</label>
            <input className="input-field" value={form.support_phone} onChange={(e) => setForm({ ...form, support_phone: e.target.value })} placeholder="+91 ..." />
          </div>
          <div>
            <label className="label">Primary Color (hex)</label>
            <input className="input-field" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} placeholder="#3aa07c" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </AdminLayout>
  );
}


