'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function CategoriesIndex() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-10">
        <div className="text-center mb-10">
          <h1>All Categories</h1>
          <p className="text-gray-600 mt-2">Browse products by category</p>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-500">No categories yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((c) => (
              <Link key={c.id} href={`/products?category=${c.id}`} className="group text-center p-6 rounded-2xl border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all duration-300 bg-white">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <span className="text-2xl font-bold text-primary-600">{c.name.charAt(0).toUpperCase()}</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{c.name}</h3>
                {c.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}


