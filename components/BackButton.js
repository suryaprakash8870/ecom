'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ label = 'Back' }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600"
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}


