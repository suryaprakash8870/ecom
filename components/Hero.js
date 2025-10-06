'use client';

import Link from 'next/link';
import { ArrowRight, Truck, Shield, Headphones } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="container py-16 md:py-20">
        <div className="text-center">
          <h1 className="mb-6">
            Welcome to India's
            <span className="block text-yellow-300">Trusted Marketplace</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
            Discover amazing products from local sellers across India. 
            Fast delivery, secure payments, and excellent customer service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-primary bg-white text-primary-600 hover:bg-neutral-100 text-lg px-8 py-3">
              Shop Now
              <ArrowRight className="inline ml-2 h-5 w-5" />
            </Link>
            <Link href="/categories" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
              Browse Categories
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Truck className="h-8 w-8 text-yellow-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-primary-100">
              Quick and reliable delivery across India with real-time tracking
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-yellow-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-primary-100">
              Safe and secure payment options with buyer protection
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Headphones className="h-8 w-8 text-yellow-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-primary-100">
              Round-the-clock customer support via WhatsApp and phone
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
