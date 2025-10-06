'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    load();
  }, [router]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Failed to load wishlist');
      setItems(data.items || []);
    } catch (_) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await fetch(`/api/wishlist?product_id=${productId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Failed');
      toast.success('Removed from wishlist');
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
    } catch (_) { toast.error('Failed'); }
  };

  const moveToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ product_id: productId, quantity: 1 }) });
      if (!res.ok) {
        const err = await res.json();
        return toast.error(err.error || 'Failed to add to cart');
      }
      await removeItem(productId);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart:updated'));
      }
      toast.success('Moved to cart');
    } catch (_) { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner text="Loading wishlist..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Wishlist</h1>
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">Your wishlist is empty.</p>
            <button onClick={() => router.push('/products')} className="btn-primary mt-4">Browse Products</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => (
              <div key={it.product_id} className="card">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                  {it.images && it.images.length > 0 ? (
                    <img src={it.images[0]} alt={it.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="font-semibold text-gray-900 line-clamp-2">{it.name}</div>
                <div className="mt-1 text-primary-600 font-bold">₹{Number(it.discount_price || it.price).toLocaleString('en-IN')}</div>
                <div className="mt-4 flex gap-2">
                  <button className="btn-primary flex-1" onClick={() => moveToCart(it.product_id)}>Move to Cart</button>
                  <button className="btn-secondary" onClick={() => removeItem(it.product_id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}


