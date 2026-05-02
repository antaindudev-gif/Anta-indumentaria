import Link from 'next/link';

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center z-50 px-6 md:px-12 py-6 bg-black/80 backdrop-blur-md border-b border-white/5">
      <Link href="/" className="font-display font-bold text-3xl tracking-[0.2em] text-white">ANTA</Link>
      <nav className="hidden md:flex gap-10 text-xs uppercase tracking-widest font-mono font-bold text-white/70">
        <Link href="/shop" className="hover:text-accent transition-colors">Catálogo</Link>
        <Link href="/about" className="hover:text-accent transition-colors">Concepto</Link>
        <Link href="/contact" className="hover:text-accent transition-colors">Contacto</Link>
        <Link href="/cart" className="hover:text-accent text-white transition-colors">Carrito (0)</Link>
      </nav>
    </header>
  );
}
