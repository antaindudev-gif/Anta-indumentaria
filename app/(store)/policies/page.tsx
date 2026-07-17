export default function PoliciesPage() {
  return (
    <main className="min-h-screen relative pt-32 pb-24 px-6 md:px-12">
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
          <div>
            <h2 className="font-display font-bold text-2xl uppercase tracking-wider mb-6 text-accent">Envíos y Despachos</h2>
            <p className="font-sans text-muted-foreground uppercase tracking-widest text-sm leading-loose mb-4">
              Trabajamos exclusivamente con las siguientes compañías de envío para asegurar que tus prendas lleguen de forma segura:
            </p>
            <ul className="list-disc list-inside font-sans text-muted-foreground uppercase tracking-widest text-sm leading-loose mb-4">
              <li><b>Starken</b>: Envíos a todo Chile (Por Pagar o Pagado).</li>
              <li><b>Chilexpress</b>: Solo a sucursales autorizadas (Por Pagar).</li>
              <li><b>Bluexpress</b>: Envíos express a domicilio.</li>
            </ul>
            <p className="font-sans text-muted-foreground uppercase tracking-widest text-sm leading-loose">
              El tiempo de procesamiento y empaquetado de tu pedido es de <b>1 a 3 días hábiles</b> desde la confirmación del pago. Una vez despachado, recibirás el número de seguimiento correspondiente. ANTA Indumentaria no se hace responsable por retrasos causados exclusivamente por la empresa de transportes.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
