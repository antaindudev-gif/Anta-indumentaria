export default function FAQPage() {
  return (
    <main className="min-h-screen relative pt-32 pb-24 px-6 md:px-12">
      <div className="noise-bg mix-blend-screen"></div>
      <div className="max-w-screen-xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-16">FAQ</h1>
        
        <div className="flex flex-col gap-8 max-w-3xl">
          {[
            { q: '¿Hacen envíos a todo Chile?', a: 'Sí, despachamos a todo el territorio nacional a través de Starken o Chilexpress.' },
            { q: '¿Cuánto demora el envío?', a: 'Los pedidos se procesan en 2-3 días hábiles. El despacho depende de la región, generalmente 2 a 5 días.' },
            { q: '¿Tienen tienda física?', a: 'Por el momento funcionamos 100% online y con entregas en puntos específicos en Santiago.' }
          ].map((faq, i) => (
            <div key={i} className="border-b border-white/10 pb-8">
              <h3 className="font-display font-bold text-xl uppercase tracking-wider mb-4">{faq.q}</h3>
              <p className="font-sans text-muted-foreground uppercase tracking-widest text-sm leading-loose">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
