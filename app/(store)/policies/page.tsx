export default function PoliciesPage() {
  return (
    <main className="min-h-screen relative bg-background pt-32 pb-24 px-6 md:px-12">
      <div className="noise-bg mix-blend-screen"></div>
      <div className="max-w-screen-xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-16">Políticas</h1>
        
        <div className="flex flex-col gap-16 max-w-3xl">
          <div>
            <h2 className="font-display font-bold text-2xl uppercase tracking-wider mb-6 text-accent">Cambios y Devoluciones</h2>
            <p className="font-sans text-muted-foreground uppercase tracking-widest text-sm leading-loose">
              Aceptamos cambios dentro de los primeros 10 días desde que recibes el producto, siempre y cuando la prenda no haya sido utilizada, lavada o modificada, y conserve sus etiquetas originales. No hacemos devoluciones de dinero por arrepentimiento de compra.
            </p>
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl uppercase tracking-wider mb-6 text-accent">Privacidad</h2>
            <p className="font-sans text-muted-foreground uppercase tracking-widest text-sm leading-loose">
              Todos los datos ingresados en el sitio web son estrictamente confidenciales y se utilizarán exclusivamente para procesar tu compra y el envío.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
