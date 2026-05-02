import { db } from "@/lib/db";
import { SettingsEditor } from "./SettingsEditor";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settingsArray = await db.query.storeSettings.findMany();
  const settings = settingsArray[0] || {
    heroTitle: "Rompe las reglas.\nHaz tu propio\ncamino.",
    heroDescription: "Estética vanguardista y disruptiva. Calidad sin límites. Vestuario urbano independiente para un mundo onírico.",
    heroCtaText: "Ver Colección",
    heroImageUrl: "",
    manifestoTitle: "Disruptive\nFluid",
    manifestoDescription: "En ANTA, creemos que la indumentaria es más que simples prendas; es una declaración de identidad, pensamiento y un vehículo de expresión profundo con el entorno.",
    galleryImage1: "",
    galleryImage2: "",
  };

  return <SettingsEditor initialSettings={settings} />;
}
