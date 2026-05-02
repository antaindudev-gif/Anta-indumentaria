import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10 px-6 md:px-12 relative z-10">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center">
            <img src="/SVG/anta-verde.svg" alt="ANTA" className="h-24 md:h-32 w-auto" />
          </Link>
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest leading-loose">
            Estética vanguardista y disruptiva. Vestuario urbano independiente.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-xs text-accent uppercase tracking-widest mb-4">Shop</h4>
          <Link href="/shop" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Todas las prendas</Link>
          <Link href="/shop?category=tops" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Tops</Link>
          <Link href="/shop?category=bottoms" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Bottoms</Link>
          <Link href="/shop?category=outerwear" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Outerwear</Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-xs text-accent uppercase tracking-widest mb-4">Ayuda</h4>
          <Link href="/faq" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Preguntas Frecuentes</Link>
          <Link href="/policies" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Envíos y Devoluciones</Link>
          <Link href="/contact" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Contacto</Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-xs text-accent uppercase tracking-widest mb-4">Social</h4>
          <a href="#" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Instagram</a>
          <a href="#" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Spotify</a>
        </div>
      </div>
      
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          &copy; 2025 Anta Indumentaria. All rights reserved.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-4 md:mt-0">
          Made in Chile
        </p>
      </div>
    </footer>
  );
}
