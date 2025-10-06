'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import toast from 'react-hot-toast';

export default function AdminMediaLibrary() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!user || !token) return (window.location.href = '/login');
    const u = JSON.parse(user);
    if (u.role !== 'admin') return (window.location.href = '/');
    load();
  }, []);

  const load = async () => {
    try {
      // This demo lists public/uploads folder by calling /api/upload (if it lists) else show empty
      const res = await fetch('/api/upload');
      const data = await res.json();
      setFiles(data.files || []);
    } catch (_) {}
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Upload failed');
      toast.success('Uploaded');
      load();
    } catch (_) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout title="Media Library" subtitle="Browse and upload media files">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="btn-primary cursor-pointer">
              <input type="file" className="hidden" onChange={onUpload} disabled={uploading} />
              {uploading ? 'Uploading...' : 'Upload File'}
            </label>
          </div>
        </div>
        {files.length === 0 ? (
          <div className="text-gray-500">No files yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((f, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <img src={f.url || f} alt="media" className="w-full h-28 object-cover" />
                <div className="p-2 text-xs truncate">{f.name || f}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


