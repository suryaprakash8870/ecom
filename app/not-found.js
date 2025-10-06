'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-primary-600 mb-4">404</div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full btn-primary flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full btn-outline flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
          
          <Link
            href="/products"
            className="w-full btn-secondary flex items-center justify-center"
          >
            <Search className="h-4 w-4 mr-2" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
