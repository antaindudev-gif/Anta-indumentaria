import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10 px-6 md:px-12 relative z-10">
      <div className="w-full max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24 mb-16">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center">
            <img src="/SVG/anta-verde.svg" alt="ANTA" className="h-5 md:h-7 w-auto" />
          </Link>
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest leading-loose">
            Estética vanguardista y disruptiva. Vestuario urbano independiente.
          </p>
          <div className="mt-6">
            <p className="font-display text-2xl md:text-3xl font-bold uppercase tracking-widest text-white">
              Made in Chile
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-xs text-accent uppercase tracking-widest mb-4">Shop</h4>
          <Link href="/shop" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Todo</Link>
          <Link href="/shop?category=poleras" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Poleras</Link>
          <Link href="/shop?category=polerones" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Polerones</Link>
          <Link href="/shop?category=buzos" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Buzos</Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-xs text-accent uppercase tracking-widest mb-4">Legal</h4>
          <Link href="/terms" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Términos y Condiciones</Link>
          <Link href="/privacy" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Políticas de Privacidad</Link>
          <Link href="/contact" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Contacto</Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-xs text-accent uppercase tracking-widest mb-4">Social</h4>
          <a href="#" className="font-sans text-sm text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Instagram</a>
        </div>
      </div>

      <div className="w-full max-w-[1800px] mx-auto flex flex-col justify-center items-center pt-8 border-t border-white/5">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest text-center">
          &copy; {new Date().getFullYear()} Anta Indumentaria. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
