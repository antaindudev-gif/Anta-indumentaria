'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="md:hidden text-white p-2 hover:text-accent transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/90 backdrop-blur-md md:hidden">
          <div className="flex justify-end p-6">
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-accent transition-colors" aria-label="Cerrar menú">
              <X className="w-7 h-7" />
            </button>
          </div>
          <nav className="flex flex-col items-center gap-8 mt-12 font-mono uppercase tracking-widest text-lg">
            <Link href="/shop" onClick={() => setIsOpen(false)} className="text-white hover:text-accent transition-colors">Catálogo</Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="text-white hover:text-accent transition-colors">Concepto</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="text-white hover:text-accent transition-colors">Contacto</Link>
            <Link href="/cart" onClick={() => setIsOpen(false)} className="text-white hover:text-accent transition-colors">Carrito</Link>
            <div className="mt-8 border-t border-white/10 pt-8 flex flex-col items-center gap-6">
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-accent hover:text-white transition-colors font-bold">Ingresar</Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
