'use client';

import { useCartStore } from '@/stores/cartStore';
import Link from 'next/link';

export function CartCount() {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <Link href="/cart" className="hover:text-accent text-white transition-colors font-mono uppercase tracking-widest text-xs font-bold relative">
      Carrito
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-4 bg-accent text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
