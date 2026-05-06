import Link from "next/link";

export const metadata = {
  title: "Términos y Condiciones | ANTA",
  description: "Términos y condiciones legales de ANTA Indumentaria.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6 md:px-12 lg:px-20 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest mb-12 border-b border-white/10 pb-6">
          Términos y Condiciones
        </h1>

        <div className="space-y-8 text-zinc-400 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase font-mono tracking-wider">1. Introducción</h2>
            <p>
              Bienvenido a ANTA Indumentaria. Los presentes Términos y Condiciones regulan el acceso y uso de nuestro sitio web, así como la compra de nuestros productos. Al utilizar este sitio, aceptas estos términos en su totalidad, en conformidad con la legislación de la República de Chile.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase font-mono tracking-wider">2. Compras y Medios de Pago</h2>
            <p>
              Todas las compras están sujetas a disponibilidad de stock. Los precios indicados en el sitio incluyen IVA (19%). Utilizamos pasarelas de pago externas reguladas, por lo que ANTA no almacena datos de tarjetas de crédito o débito de los usuarios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase font-mono tracking-wider">3. Derecho a Retracto (Ley Pro Consumidor)</h2>
            <p>
              En cumplimiento con la Ley de Protección al Derechos de los Consumidores (Ley 19.496) y sus modificaciones, el cliente tiene el derecho de retracto. Podrás devolver el producto y solicitar la anulación de la compra dentro de los primeros 10 días desde la recepción del artículo, siempre y cuando el producto no haya sido utilizado, mantenga sus etiquetas originales y su embalaje en buen estado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase font-mono tracking-wider">4. Cambios y Garantía Legal</h2>
            <p>
              En caso de que el producto presente fallas de fábrica, tienes derecho a la Garantía Legal (6 meses desde la recepción del producto). Puedes optar por el cambio, la reparación gratuita o la devolución de tu dinero. Esta garantía no cubre daños causados por mal uso o por no seguir las instrucciones de lavado.
            </p>
            <p className="mt-4">
              Para solicitar un cambio por talla o gusto (fuera de garantía legal), tienes un plazo de 30 días desde la recepción de la prenda. Los costos de envío en este caso serán responsabilidad del cliente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase font-mono tracking-wider">5. Envíos y Despachos</h2>
            <p>
              Los plazos de envío varían según la comuna y región de destino. Al momento de la compra, recibirás una estimación del tiempo de entrega. ANTA no se hace responsable por retrasos atribuibles a la empresa de transporte externa, aunque asistiremos en la resolución de cualquier problema logístico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase font-mono tracking-wider">6. Artículos en Pre-Order</h2>
            <p>
              Los productos catalogados como "Pre-Order" son fabricados a pedido o tienen una fecha de envío diferida. Al comprar un producto en Pre-Order, aceptas los plazos de confección y envío indicados explícitamente en la página del producto.
            </p>
          </section>

          <div className="pt-12 border-t border-white/10 flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">Última actualización: Mayo 2026</p>
            <Link href="/" className="text-accent hover:text-white transition-colors font-mono text-xs uppercase tracking-widest">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
