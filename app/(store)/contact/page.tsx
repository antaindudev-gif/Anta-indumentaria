"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { sendContactMessage } from "@/app/actions/contact";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("message", message);
      await sendContactMessage(fd);
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative pt-32 pb-24 px-6 md:px-12">
      <div className="noise-bg mix-blend-screen"></div>
      <div className="max-w-screen-xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-8">Contacto</h1>
        <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest mb-16">
          Escríbenos para dudas sobre envíos o pedidos.
        </p>

        {sent ? (
          <div className="max-w-2xl border border-accent/30 bg-accent/5 p-8 flex flex-col gap-4">
            <p className="font-mono text-accent text-sm uppercase tracking-widest">✅ Mensaje enviado</p>
            <p className="font-sans text-sm text-zinc-400 uppercase tracking-widest leading-loose">
              Recibimos tu mensaje y te responderemos a la brevedad por correo.
            </p>
            <button
              onClick={() => setSent(false)}
              className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors w-fit"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-name" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Nombre *
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#111111] border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-email" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Email *
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#111111] border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-message" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Mensaje *
              </label>
              <textarea
                id="contact-message"
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-[#111111] border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <div role="alert" className="border border-red-500/30 bg-red-500/5 p-4 text-red-400 font-mono text-xs uppercase tracking-widest">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-accent text-black font-sans font-bold uppercase tracking-widest py-4 hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
