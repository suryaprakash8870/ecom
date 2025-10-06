'use client';

import { useEffect, useState } from 'react';
import { Star, Play } from 'lucide-react';

export default function TestimonialsCarousel() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/testimonials');
        const data = await res.json();
        setItems(data.testimonials || []);
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items]);

  if (items.length === 0) return null;
  const t = items[index];

  return (
    <section className="py-12 bg-white">
      <div className="container">
        <h2 className="mb-6">What our customers say</h2>
        <div className="bg-gray-50 rounded-2xl p-6 border border-neutral-200 flex flex-col md:flex-row gap-6 items-center">
          {t.media_url ? (
            t.media_url.endsWith('.mp4') ? (
              <video className="w-full md:w-1/3 rounded-lg" controls src={t.media_url} />
            ) : (
              <img className="w-full md:w-1/3 rounded-lg object-cover" src={t.media_url} alt={t.title || t.customer_name} />
            )
          ) : null}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="font-semibold text-gray-900">{t.customer_name}</div>
              {t.rating ? (
                <div className="flex ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              ) : null}
            </div>
            {t.title && <div className="font-medium text-gray-900 mb-1">{t.title}</div>}
            <p className="text-gray-700">{t.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}


