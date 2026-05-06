import Link from "next/link";

export const metadata = {
  title: "Políticas de Privacidad | ANTA",
  description: "Políticas de privacidad y protección de datos de ANTA Indumentaria.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6 md:px-12 lg:px-20 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest mb-12 border-b border-white/10 pb-6">
          Políticas de Privacidad
        </h1>

        <div className="space-y-8 text-zinc-400 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase font-mono tracking-wider">1. Protección de Datos (Ley 19.628)</h2>
            <p>
              En ANTA Indumentaria nos tomamos muy en serio la seguridad de la información. Cumplimos a cabalidad con la Ley 19.628 sobre Protección de la Vida Privada. Los datos personales entregados por los usuarios solo serán utilizados para procesar compras, coordinar despachos y para fines comunicacionales internos, previa autorización.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase font-mono tracking-wider">2. Recopilación de Información</h2>
            <p>
              Al registrarte o realizar una compra, recopilamos tu nombre completo, correo electrónico, dirección de envío y número de teléfono. Estos datos son estrictamente confidenciales y bajo ninguna circunstancia serán vendidos, arrendados ni compartidos con terceros ajenos a la logística de envíos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase font-mono tracking-wider">3. Correos Electrónicos y Marketing</h2>
            <p>
              El envío de correos electrónicos informativos o promocionales se realizará solo si el usuario lo consiente explícitamente. Siempre tendrás la opción de desuscribirte de nuestras listas de correo haciendo clic en el enlace provisto al final de cada email o contactándonos directamente a nuestro correo de soporte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase font-mono tracking-wider">4. Cookies y Análisis de Datos</h2>
            <p>
              Nuestro sitio web puede utilizar cookies para mejorar la experiencia de navegación, recordar los productos en tu carrito y recopilar estadísticas anónimas de tráfico. Puedes configurar tu navegador para bloquear estas cookies, aunque esto podría afectar el funcionamiento de algunas características de la tienda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase font-mono tracking-wider">5. Derechos ARCO</h2>
            <p>
              De acuerdo a la legislación chilena, cuentas con los derechos de Acceso, Rectificación, Cancelación y Oposición sobre tus datos personales. Puedes ejercer estos derechos en cualquier momento enviándonos un correo electrónico solicitando la eliminación completa de tu cuenta o la modificación de tus datos.
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
