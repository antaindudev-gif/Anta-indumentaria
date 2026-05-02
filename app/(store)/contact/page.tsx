export default function ContactPage() {
  return (
    <main className="min-h-screen relative bg-background pt-32 pb-24 px-6 md:px-12">
      <div className="noise-bg mix-blend-screen"></div>
      <div className="max-w-screen-xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-8">Contacto</h1>
        <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest mb-16">Escríbenos para dudas sobre envíos o pedidos.</p>
        
        <form className="flex flex-col gap-8 max-w-2xl">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs uppercase tracking-widest">Nombre</label>
            <input type="text" className="bg-[#111111] border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs uppercase tracking-widest">Email</label>
            <input type="email" className="bg-[#111111] border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs uppercase tracking-widest">Mensaje</label>
            <textarea rows={5} className="bg-[#111111] border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors"></textarea>
          </div>
          <button className="bg-accent text-black font-sans font-bold uppercase tracking-widest py-4 hover:bg-white transition-colors">
            Enviar Mensaje
          </button>
        </form>
      </div>
    </main>
  );
}
