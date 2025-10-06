'use client';

import Header from './Header';
import Footer from './Footer';
import Link from 'next/link';
import { LayoutGrid, ShoppingCart, Package, Users, Bookmark, Image as ImageIcon, Settings } from 'lucide-react';

export default function AdminLayout({ title, subtitle, children }) {
  const NavItem = ({ href, label, Icon }) => (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-100`}>
      <Icon className="h-4 w-4 text-gray-500" />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 sticky top-20">
              <div className="text-xs font-semibold text-gray-500 px-2 mb-2">Admin</div>
              <nav className="space-y-1">
                <NavItem href="/admin" label="Dashboard" Icon={LayoutGrid} />
                <NavItem href="/admin/orders" label="Orders" Icon={ShoppingCart} />
                <NavItem href="/admin/products" label="Products" Icon={Package} />
                <NavItem href="/admin/categories" label="Categories" Icon={Bookmark} />
                <NavItem href="/admin/users" label="Users" Icon={Users} />
                <NavItem href="/admin/testimonials" label="Testimonials" Icon={Bookmark} />
                <NavItem href="/admin/media" label="Media" Icon={ImageIcon} />
                <NavItem href="/admin/settings" label="Settings" Icon={Settings} />
              </nav>
            </div>
          </aside>
          <div className="lg:col-span-3">
            {(title || subtitle) && (
              <div className="mb-6">
                {title && <h1 className="text-3xl font-bold text-gray-900">{title}</h1>}
                {subtitle && <p className="text-gray-600">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


