'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductGrid({ products, title = "Products", viewMode = 'grid' }) {
  const [loading, setLoading] = useState({});

  const addToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }

    setLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      });

      if (response.ok) {
        toast.success('Added to cart successfully');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart:updated'));
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!products || products.length === 0) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{title}</h2>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        </div>
      </section>
    );
  }

  const Card = ({ product }) => {
    const rating = Number(product.rating || 4);
    const discount = product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full">
        <Link href={`/products/${product.id}`}>
          <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/0 to-transparent pointer-events-none" />
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {discount}% OFF
              </div>
            )}
            <button
              aria-label="Add to wishlist"
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm text-gray-600 hover:text-red-500 transition-colors"
              onClick={async (e) => {
                e.preventDefault();
                const token = localStorage.getItem('token');
                if (!token) return toast.error('Login to use wishlist');
                try {
                  const res = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ product_id: product.id }) });
                  if (!res.ok) {
                    const err = await res.json();
                    return toast.error(err.error || 'Failed');
                  }
                  toast.success('Added to wishlist');
                } catch (_) { toast.error('Failed'); }
              }}
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </Link>

        <div className="p-4 flex-1 flex flex-col">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 min-h-[44px]">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">({rating.toFixed(1)})</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(product.discount_price || product.price)}
            </span>
            {product.discount_price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="mt-auto pt-3">
            <button
              onClick={() => addToCart(product.id)}
              disabled={loading[product.id] || product.stock_quantity === 0}
              className={`w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl font-medium transition-colors ${
                product.stock_quantity === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : loading[product.id]
                  ? 'bg-primary-400 text-white cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {loading[product.id] ? (
                <div className="spinner" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              <span>
                {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-16">
      <div className="container">
        <h2 className="mb-8 text-center">{title}</h2>
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-neutral-200 shadow-card p-4 flex gap-4 items-center">
                <Link href={`/products/${p.id}`} className="relative w-28 h-28 overflow-hidden rounded-xl bg-gray-100 flex-shrink-0">
                  {p.images && p.images[0] ? (
                    <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                  ) : null}
                </Link>
                <div className="flex-1">
                  <Link href={`/products/${p.id}`} className="block font-semibold text-gray-900 hover:text-primary-600 line-clamp-2">{p.name}</Link>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-bold text-primary-600">{formatPrice(p.discount_price || p.price)}</span>
                    {p.discount_price && <span className="text-sm text-gray-500 line-through">{formatPrice(p.price)}</span>}
                  </div>
                </div>
                <div className="w-40">
                  <button
                    onClick={() => addToCart(p.id)}
                    disabled={loading[p.id] || p.stock_quantity === 0}
                    className={`w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl font-medium transition-colors ${
                      p.stock_quantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : loading[p.id]
                        ? 'bg-primary-400 text-white cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {loading[p.id] ? <div className="spinner" /> : <ShoppingCart className="h-4 w-4" />}
                    <span>{p.stock_quantity === 0 ? 'Out' : 'Add'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        )}

        {products.length >= 8 && (
          <div className="text-center mt-12">
            <Link href="/products" className="btn-primary text-lg px-8 py-3">
              View All Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
