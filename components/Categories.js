'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Categories({ categories }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="mb-4">Shop by Category</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover products from various categories tailored for Indian customers
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.slice(0, 10).map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group text-center p-6 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <span className="text-2xl font-bold text-primary-600">
                  {category.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/categories"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            View All Categories
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
