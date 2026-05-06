'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag, User, LogOut } from 'lucide-react';
import { createPortal } from 'react-dom';

export function MobileMenu({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuContent = (
    <div className="fixed inset-0 z-[9998] bg-black md:hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <img src="/SVG/icon-blanco.svg" alt="ANTA" className="h-10 w-auto" />
        <button onClick={() => setIsOpen(false)} className="text-white hover:text-accent transition-colors" aria-label="Cerrar menú">
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col items-center justify-center flex-1 gap-10 font-mono uppercase tracking-[0.3em] text-xl">
        <Link href="/shop" onClick={() => setIsOpen(false)} className="text-white hover:text-accent transition-colors">Catálogo</Link>
        <Link href="/about" onClick={() => setIsOpen(false)} className="text-white hover:text-accent transition-colors">Concepto</Link>
        <Link href="/contact" onClick={() => setIsOpen(false)} className="text-white hover:text-accent transition-colors">Contacto</Link>
        <Link href="/cart" onClick={() => setIsOpen(false)} className="text-white hover:text-accent transition-colors flex items-center gap-3">
          <ShoppingBag className="w-5 h-5" /> Carrito
        </Link>
      </nav>

      {/* Bottom Auth Section */}
      <div className="p-8 border-t border-white/10 flex flex-col items-center gap-4">
        {session?.user ? (
          <>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">{session.user.email}</p>
            <div className="flex gap-6">
              {session.user.role === 'admin' && (
                <Link href="/admin" onClick={() => setIsOpen(false)} className="text-accent font-mono text-sm uppercase tracking-widest font-bold">Admin</Link>
              )}
              <Link href="/profile" onClick={() => setIsOpen(false)} className="text-white font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4" /> Perfil
              </Link>
            </div>
          </>
        ) : (
          <Link href="/login" onClick={() => setIsOpen(false)} className="text-accent hover:text-white transition-colors font-mono text-sm uppercase tracking-widest font-bold">
            Ingresar
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="md:hidden text-white p-2 hover:text-accent transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="w-7 h-7" />
      </button>

      {/* Fullscreen Overlay using Portal */}
      {mounted && isOpen && createPortal(menuContent, document.body)}
    </>
  );
}
