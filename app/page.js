'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Categories from '../components/Categories';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import TestimonialsCarousel from '../components/TestimonialsCarousel';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?limit=8'),
        fetch('/api/categories')
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Hero />
        <Categories categories={categories} />
        <ProductGrid products={products} title="Featured Products" />
        <TestimonialsCarousel />
      </main>
      <Footer />
    </div>
  );
}
