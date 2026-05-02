import { signIn } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Background Noise & Gradient */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black pointer-events-none"></div>

      <div className="relative z-10 flex flex-col gap-8 w-full max-w-md border border-white/10 bg-[#0a0a0a] p-8 md:p-12 shadow-2xl">
        <Link href="/" className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest w-fit mb-4">
          <ArrowLeft className="w-3 h-3" /> Volver a la Tienda
        </Link>
        
        <div className="flex flex-col gap-2">
          <h1 className="font-display font-bold text-3xl tracking-[0.2em] text-white">INGRESAR</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Accede para ver tus órdenes y guardar tus datos de envío.
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/profile" });
            }}
          >
            <button type="submit" className="w-full bg-white text-black hover:bg-accent transition-colors font-mono font-bold text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-3">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </button>
          </form>
        </div>

        <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 text-center mt-6">
          AL INGRESAR, ACEPTAS NUESTROS TÉRMINOS Y CONDICIONES.
        </p>
      </div>
    </div>
  );
}
