'use client';

import { useCartStore } from '@/stores/cartStore';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';

export function CartCount() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link href="/cart" className="hover:text-accent text-white transition-colors flex items-center gap-2 relative">
      <ShoppingBag className="w-6 h-6" />
      {mounted && totalItems > 0 && (
        <span className="absolute -top-2 -right-3 bg-accent text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
