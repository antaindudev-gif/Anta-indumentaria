"use client";

import { useState, useRef } from "react";
import { updateStoreSettings } from "@/app/actions/settings";
import Image from "next/image";
import { ArrowRight, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// ─── Upload helper ────────────────────────────────────────────────────────────
// Uploads a file directly to R2 using a presigned PUT URL.
// Returns the final public URL, or throws on error.
async function uploadImageToR2(file: File, folder: string = "home"): Promise<string> {
  // 1. Get presigned URL from our API route
  const params = new URLSearchParams({
    folder,
    contentType: file.type,
    filename: file.name,
  });
  const res = await fetch(`/api/upload-url?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Error al obtener URL de subida");
  }
  const { uploadUrl, finalUrl } = await res.json();

  // 2. Upload directly to R2 — bypasses Vercel entirely
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadRes.ok) {
    throw new Error(`Error al subir imagen a R2: HTTP ${uploadRes.status}`);
  }

  return finalUrl as string;
}

// ─── ImageUploadField ─────────────────────────────────────────────────────────
interface ImageUploadFieldProps {
  id: string;
  label: string;
  currentUrl: string | null;
  folder?: string;
  onUploaded: (url: string) => void;
  accent?: boolean;
}

function ImageUploadField({ id, label, currentUrl, folder = "home", onUploaded, accent = false }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setUploadError(null);
    setUploaded(false);

    try {
      const url = await uploadImageToR2(file, folder);
      onUploaded(url);
      setPreview(url);
      setUploaded(true);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir imagen");
      // Reset preview to previous on error
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  };

  const labelColor = accent ? "text-accent" : "text-muted-foreground";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={`font-mono text-[10px] uppercase tracking-widest ${labelColor}`}>
        {label}
      </label>

      {preview && (
        <div className="relative w-full aspect-video bg-[#111] overflow-hidden border border-white/5">
          <img src={preview} className="object-cover w-full h-full" alt={`Preview ${label}`} />
        </div>
      )}

      <label
        htmlFor={id}
        className={`flex items-center justify-between gap-3 border border-dashed p-4 cursor-pointer transition-colors text-xs font-mono uppercase tracking-widest ${
          uploading
            ? "border-accent/50 text-accent/50 cursor-not-allowed"
            : uploaded
            ? "border-green-500/30 text-green-400"
            : uploadError
            ? "border-red-500/30 text-red-400"
            : "border-white/10 text-zinc-500 hover:border-accent hover:text-accent"
        }`}
      >
        <span className="flex items-center gap-2">
          {uploading ? (
            <><Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> Subiendo...</>
          ) : uploaded ? (
            <><CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Imagen subida</>
          ) : uploadError ? (
            <><AlertCircle className="w-3 h-3" aria-hidden="true" /> Reintentar</>
          ) : (
            <>Seleccionar imagen</>
          )}
        </span>
        <span className="text-zinc-600 text-[10px]">JPG · PNG · WEBP</span>
      </label>

      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        disabled={uploading}
        onChange={handleChange}
        className="sr-only"
        aria-label={label}
      />

      {uploadError && (
        <p className="font-mono text-[10px] text-red-400 uppercase tracking-widest leading-relaxed">
          {uploadError}
        </p>
      )}
    </div>
  );
}

// ─── SettingsEditor ───────────────────────────────────────────────────────────

export function SettingsEditor({ initialSettings }: { initialSettings: any }) {
  // Text fields
  const [heroTitle, setHeroTitle] = useState(initialSettings.heroTitle ?? "");
  const [heroDescription, setHeroDescription] = useState(initialSettings.heroDescription ?? "");
  const [heroCtaText, setHeroCtaText] = useState(initialSettings.heroCtaText ?? "");
  const [manifestoTitle, setManifestoTitle] = useState(initialSettings.manifestoTitle ?? "");
  const [manifestoDescription, setManifestoDescription] = useState(initialSettings.manifestoDescription ?? "");
  const [conceptHeading1, setConceptHeading1] = useState(initialSettings.conceptHeading1 ?? "CREATIVE CONCEPT");
  const [conceptText1, setConceptText1] = useState(initialSettings.conceptText1 ?? "");
  const [conceptHeading2, setConceptHeading2] = useState(initialSettings.conceptHeading2 ?? "DISRUPTIVE FLUID");
  const [conceptText2, setConceptText2] = useState(initialSettings.conceptText2 ?? "");

  // Image URLs — updated after each direct R2 upload
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(initialSettings.heroImageUrl ?? null);
  const [galleryImage1, setGalleryImage1] = useState<string | null>(initialSettings.galleryImage1 ?? null);
  const [galleryImage2, setGalleryImage2] = useState<string | null>(initialSettings.galleryImage2 ?? null);
  const [conceptImage1, setConceptImage1] = useState<string | null>(initialSettings.conceptImage1 ?? null);
  const [conceptImage2, setConceptImage2] = useState<string | null>(initialSettings.conceptImage2 ?? null);

  // Shipping config
  const [shippingFlatRate, setShippingFlatRate] = useState<number>(initialSettings.shippingFlatRate ?? 0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(initialSettings.freeShippingThreshold ?? 0);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const formData = new FormData();
      // Text fields
      formData.append("heroTitle", heroTitle);
      formData.append("heroDescription", heroDescription);
      formData.append("heroCtaText", heroCtaText);
      formData.append("manifestoTitle", manifestoTitle);
      formData.append("manifestoDescription", manifestoDescription);
      formData.append("conceptHeading1", conceptHeading1);
      formData.append("conceptText1", conceptText1);
      formData.append("conceptHeading2", conceptHeading2);
      formData.append("conceptText2", conceptText2);
      formData.append("shippingFlatRate", shippingFlatRate.toString());
      formData.append("freeShippingThreshold", freeShippingThreshold.toString());
      // Image URLs (only if they were set/changed)
      if (heroImageUrl) formData.append("heroImageUrl", heroImageUrl);
      if (galleryImage1) formData.append("galleryImage1", galleryImage1);
      if (galleryImage2) formData.append("galleryImage2", galleryImage2);
      if (conceptImage1) formData.append("conceptImage1", conceptImage1);
      if (conceptImage2) formData.append("conceptImage2", conceptImage2);

      await updateStoreSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-6rem)] gap-8 overflow-hidden">

      {/* LEFT FORM PANE */}
      <div className="w-1/2 h-full overflow-y-auto pr-4 custom-scrollbar">
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-8">Edición: Home</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-12 pb-24">

          {/* 1. HERO */}
          <div className="border border-white/10 bg-[#0a0a0a] p-8 flex flex-col gap-6">
            <h2 className="font-mono text-accent text-sm uppercase tracking-widest border-b border-white/10 pb-4">1. Hero (Inicio)</h2>

            <div className="flex flex-col gap-2">
              <label htmlFor="heroTitle" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Título Principal</label>
              <textarea id="heroTitle" name="heroTitle" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} rows={3}
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="heroDescription" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Descripción</label>
              <textarea id="heroDescription" value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} rows={2}
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="heroCtaText" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Texto del Botón</label>
              <input id="heroCtaText" value={heroCtaText} onChange={(e) => setHeroCtaText(e.target.value)} type="text"
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>

            <div className="border-t border-white/5 pt-6">
              <ImageUploadField
                id="heroImageFile"
                label="Fondo del Home (se sube directo a R2)"
                currentUrl={heroImageUrl}
                folder="home"
                onUploaded={setHeroImageUrl}
                accent
              />
            </div>
          </div>

          {/* 2. MANIFESTO & GALERÍA */}
          <div className="border border-white/10 bg-[#0a0a0a] p-8 flex flex-col gap-6">
            <h2 className="font-mono text-accent text-sm uppercase tracking-widest border-b border-white/10 pb-4">2. Manifiesto & Galería</h2>

            <div className="flex flex-col gap-2">
              <label htmlFor="manifestoTitle" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Título Manifiesto</label>
              <textarea id="manifestoTitle" value={manifestoTitle} onChange={(e) => setManifestoTitle(e.target.value)} rows={2}
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="manifestoDescription" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Texto del Manifiesto</label>
              <textarea id="manifestoDescription" value={manifestoDescription} onChange={(e) => setManifestoDescription(e.target.value)} rows={3}
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
              <ImageUploadField id="galleryImage1File" label="Galería 1" currentUrl={galleryImage1} folder="home" onUploaded={setGalleryImage1} accent />
              <ImageUploadField id="galleryImage2File" label="Galería 2" currentUrl={galleryImage2} folder="home" onUploaded={setGalleryImage2} accent />
            </div>
          </div>

          {/* 3. CONCEPTO */}
          <div className="border border-white/10 bg-[#0a0a0a] p-8 flex flex-col gap-6">
            <h2 className="font-mono text-accent text-sm uppercase tracking-widest border-b border-white/10 pb-4">3. Página Concepto (/concepto)</h2>

            <div className="flex flex-col gap-2">
              <label htmlFor="conceptHeading1" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Título Bloque 1</label>
              <input id="conceptHeading1" value={conceptHeading1} onChange={(e) => setConceptHeading1(e.target.value)}
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="conceptText1" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Texto Bloque 1</label>
              <textarea id="conceptText1" value={conceptText1} onChange={(e) => setConceptText1(e.target.value)} rows={4}
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>
            <ImageUploadField id="conceptImage1File" label="Imagen Bloque 1" currentUrl={conceptImage1} folder="home" onUploaded={setConceptImage1} accent />

            <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="conceptHeading2" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Título Bloque 2</label>
                <input id="conceptHeading2" value={conceptHeading2} onChange={(e) => setConceptHeading2(e.target.value)}
                  className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="conceptText2" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Texto Bloque 2</label>
                <textarea id="conceptText2" value={conceptText2} onChange={(e) => setConceptText2(e.target.value)} rows={4}
                  className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
              </div>
              <ImageUploadField id="conceptImage2File" label="Imagen Bloque 2" currentUrl={conceptImage2} folder="home" onUploaded={setConceptImage2} accent />
            </div>
          </div>

          {/* 4. ENVÍO */}
          <div className="border border-white/10 bg-[#0a0a0a] p-8 flex flex-col gap-6">
            <h2 className="font-mono text-accent text-sm uppercase tracking-widest border-b border-white/10 pb-4">4. Configuración de Envío</h2>
            <p className="font-sans text-xs text-zinc-500 uppercase tracking-widest leading-loose">
              Define la tarifa de envío. Si configuras un umbral, pedidos que lo superen tendrán envío gratis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="shippingFlatRate" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Tarifa Fija (CLP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-zinc-500" aria-hidden="true">$</span>
                  <input id="shippingFlatRate" type="number" min="0" step="100" value={shippingFlatRate}
                    onChange={(e) => setShippingFlatRate(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-black border border-white/10 pl-8 pr-4 py-4 font-mono text-sm text-white outline-none focus:border-accent transition-colors" />
                </div>
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                  {shippingFlatRate === 0 ? "Envío siempre gratis" : `$${shippingFlatRate.toLocaleString("es-CL")} por pedido`}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="freeShippingThreshold" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Umbral Envío Gratis (CLP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-zinc-500" aria-hidden="true">$</span>
                  <input id="freeShippingThreshold" type="number" min="0" step="1000" value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-black border border-white/10 pl-8 pr-4 py-4 font-mono text-sm text-white outline-none focus:border-accent transition-colors" />
                </div>
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                  {freeShippingThreshold === 0 ? "Sin umbral de envío gratis" : `Gratis en pedidos sobre $${freeShippingThreshold.toLocaleString("es-CL")}`}
                </p>
              </div>
            </div>

            <div className="border border-white/5 bg-black p-4 flex flex-col gap-1 font-mono text-xs">
              <p className="text-zinc-500 uppercase tracking-widest mb-2">Simulación</p>
              {[10000, 20000, 50000, 100000].map((amount) => {
                const cost = freeShippingThreshold > 0 && amount >= freeShippingThreshold ? 0 : shippingFlatRate;
                return (
                  <div key={amount} className="flex justify-between text-zinc-400">
                    <span>Compra ${amount.toLocaleString("es-CL")}</span>
                    <span className={cost === 0 ? "text-green-400" : "text-accent"}>
                      {cost === 0 ? "Envío Gratis" : `Envío $${cost.toLocaleString("es-CL")}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {saveError && (
            <div role="alert" className="border border-red-500/30 bg-red-500/5 p-4 text-red-400 font-mono text-xs uppercase tracking-widest leading-relaxed">
              {saveError}
            </div>
          )}

          <button
            disabled={isSubmitting}
            type="submit"
            className={`transition-colors font-mono font-bold text-sm uppercase tracking-widest px-10 py-5 shadow-2xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
              saveSuccess ? "bg-green-500 text-black" : "bg-white text-black hover:bg-accent"
            }`}
          >
            {isSubmitting && <Loader2 className="animate-spin w-4 h-4" aria-hidden="true" />}
            {saveSuccess ? "✓ Cambios Guardados" : "Guardar Cambios y Publicar"}
          </button>
        </form>
      </div>

      {/* RIGHT PREVIEW PANE */}
      <div className="w-1/2 h-full bg-[#050505] border border-white/5 overflow-y-auto relative custom-scrollbar">
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-50 p-2 border-b border-white/10 flex justify-between items-center">
          <span className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest">Previsualización: Home</span>
        </div>

        <div className="scale-[0.8] origin-top flex flex-col min-h-[150vh] relative bg-background overflow-hidden pointer-events-none">
          <div className="noise-bg mix-blend-screen absolute inset-0 z-0" />

          <section className="relative min-h-[90vh] flex flex-col justify-center px-12 pt-32 pb-24 z-10 w-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center z-0 mix-blend-difference opacity-40">
              <span className="text-[32vw] font-display font-bold leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.1)] whitespace-nowrap tracking-tighter" aria-hidden="true">
                ANTA
              </span>
            </div>

            <div className="relative z-20 flex flex-col lg:flex-row gap-16 items-center justify-between mt-12 w-full">
              <div className="flex-1 max-w-2xl pb-4">
                <h2 className="text-5xl md:text-7xl font-display font-bold text-foreground uppercase tracking-tight mb-6 leading-[0.85] whitespace-pre-line">
                  {heroTitle || "ROMPE LAS REGLAS."}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground font-sans tracking-[0.2em] uppercase mb-10 max-w-lg leading-loose">
                  {heroDescription}
                </p>
                <div className="bg-accent text-black text-sm px-10 py-7 font-sans font-bold uppercase tracking-widest w-fit flex items-center">
                  {heroCtaText} <ArrowRight className="ml-4 w-5 h-5" aria-hidden="true" />
                </div>
              </div>

              <div className="w-full lg:w-[450px] relative aspect-[3/4] bg-[#111111] flex items-center justify-center border border-white/5 shadow-2xl overflow-hidden">
                {heroImageUrl ? (
                  <Image src={heroImageUrl} alt="Vista previa hero" fill className="object-cover grayscale" />
                ) : (
                  <ImageIcon className="w-12 h-12 opacity-50 text-zinc-500" aria-hidden="true" />
                )}
                <div className="absolute top-4 left-4 border-l border-t w-8 h-8 border-accent z-20 pointer-events-none" />
                <div className="absolute bottom-4 right-4 border-r border-b w-8 h-8 border-accent z-20 pointer-events-none" />
              </div>
            </div>
          </section>

          <section className="py-32 px-12 bg-background relative z-10 border-t border-white/10">
            <div className="flex flex-col md:flex-row gap-24 items-center">
              <div className="flex-1 grid grid-cols-2 gap-4">
                {[galleryImage1, galleryImage2].map((url, idx) => (
                  <div key={idx} className="relative aspect-[3/4] bg-[#111111] overflow-hidden flex items-center justify-center border border-white/5">
                    {url ? (
                      <Image src={url} alt={`Galería ${idx + 1}`} fill className="object-cover opacity-80" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-600" aria-hidden="true" />
                    )}
                    <div className="absolute bottom-4 left-4 font-mono text-xs text-muted-foreground z-30">00{idx + 1}</div>
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <h3 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-wider mb-8 text-foreground leading-none whitespace-pre-line">
                  {manifestoTitle}
                </h3>
                <p className="font-sans text-muted-foreground text-xs md:text-sm uppercase tracking-[0.2em] leading-loose max-w-md mb-8">
                  {manifestoDescription}
                </p>
                <div className="text-accent uppercase tracking-widest text-xs font-bold flex items-center">
                  Brand Manifesto <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
