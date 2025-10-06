'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) return router.push('/login');
    const u = JSON.parse(user);
    if (u.role !== 'admin') return router.push('/');
    load();
  }, [router, roleFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      const res = await fetch(`/api/admin/users?${params}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Failed to load users');
      setUsers(data.users || []);
    } catch (_) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const setRole = async (id, role) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ user_id: id, role })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Update failed');
      toast.success('Role updated');
      load();
    } catch (_) {
      toast.error('Failed to update role');
    }
  };

  if (loading) return <LoadingSpinner text="Loading users..." />;

  return (
    <AdminLayout title="Manage Users">
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <div className="mt-4 flex gap-3">
            <select className="input-field max-w-xs" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">{u.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <select className="input-field" value={u.role} onChange={(e) => setRole(u.id, e.target.value)}>
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}


