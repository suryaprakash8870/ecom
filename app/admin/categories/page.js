'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', image_url: '', parent_id: '' });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    const u = JSON.parse(userData);
    if (u.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(u);
    loadCategories();
  }, [router]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          image_url: form.image_url || null,
          parent_id: form.parent_id ? Number(form.parent_id) : null
        })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to create category');
        return;
      }
      toast.success('Category created');
      setForm({ name: '', description: '', image_url: '', parent_id: '' });
      loadCategories();
    } catch (e) {
      toast.error('Failed to create category');
    }
  };

  if (loading) return <LoadingSpinner text="Loading categories..." />;

  return (
    <AdminLayout title="Manage Categories" subtitle="Create and view product categories">
      <div>
        <div className="mb-6">
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Existing Categories</h2>
            {categories.length === 0 ? (
              <p className="text-gray-500">No categories yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {categories.map((c) => (
                  <li key={c.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-gray-900">{c.name}</div>
                      {c.description && <div className="text-sm text-gray-500">{c.description}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn-secondary"
                        onClick={() => setForm({ name: c.name, description: c.description || '', image_url: c.image_url || '', parent_id: c.parent_id || '' }) || (document.getElementById('edit-id').value = c.id)}
                      >Edit</button>
                      <button
                        className="btn-outline"
                        onClick={async () => {
                          if (!confirm('Delete this category?')) return;
                          const token = localStorage.getItem('token');
                          const res = await fetch(`/api/categories/${c.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                          const data = await res.json();
                          if (!res.ok) return toast.error(data.error || 'Delete failed');
                          toast.success('Category deleted');
                          loadCategories();
                        }}
                      >Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Create Category</h2>
            <form onSubmit={createCategory} className="space-y-4">
              <input id="edit-id" type="hidden" />
              <div>
                <label className="label">Name *</label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input
                  className="input-field"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="label">Parent Category ID (optional)</label>
                <input
                  className="input-field"
                  value={form.parent_id}
                  onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                  placeholder="e.g., 1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button type="submit" className="btn-primary w-full">Save</button>
                <button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={() => {
                    const id = document.getElementById('edit-id')?.value;
                    if (!id) return toast.error('Select a category to update (click Edit)');
                    (async () => {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`/api/categories/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                          name: form.name,
                          description: form.description,
                          image_url: form.image_url || null,
                          parent_id: form.parent_id ? Number(form.parent_id) : null
                        })
                      });
                      const data = await res.json();
                      if (!res.ok) return toast.error(data.error || 'Update failed');
                      toast.success('Category updated');
                      setForm({ name: '', description: '', image_url: '', parent_id: '' });
                      const hidden = document.getElementById('edit-id');
                      if (hidden) hidden.value = '';
                      loadCategories();
                    })();
                  }}
                >Update</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


