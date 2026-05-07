"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ruler } from "lucide-react";

export function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-white transition-colors underline underline-offset-4">
        <Ruler className="w-4 h-4" />
        Guía de Tallas
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-[#111111] border-white/10 text-white rounded-none p-0 overflow-hidden">
        <div className="noise-bg mix-blend-screen"></div>
        <DialogHeader className="p-6 md:p-8 border-b border-white/10 relative z-10 bg-black/50">
          <DialogTitle className="font-display font-bold text-2xl md:text-3xl uppercase tracking-widest">
            Tabla de Medidas
          </DialogTitle>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-2">
            Medidas en centímetros (cm). Puede haber una variación de 1-2 cm debido a la fabricación artesanal.
          </p>
        </DialogHeader>
        <div className="p-6 md:p-8 relative z-10 overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/50">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="font-mono text-xs text-white uppercase tracking-widest h-12">Talla</TableHead>
                <TableHead className="font-mono text-xs text-white uppercase tracking-widest h-12">Ancho (Pecho)</TableHead>
                <TableHead className="font-mono text-xs text-white uppercase tracking-widest h-12">Largo</TableHead>
                <TableHead className="font-mono text-xs text-white uppercase tracking-widest h-12">Manga</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-display font-bold text-lg text-accent">S</TableCell>
                <TableCell className="font-mono text-sm text-zinc-400">54 cm</TableCell>
                <TableCell className="font-mono text-sm text-zinc-400">70 cm</TableCell>
                <TableCell className="font-mono text-sm text-zinc-400">22 cm</TableCell>
              </TableRow>
              <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-display font-bold text-lg text-accent">M</TableCell>
                <TableCell className="font-mono text-sm text-zinc-400">56 cm</TableCell>
                <TableCell className="font-mono text-sm text-zinc-400">72 cm</TableCell>
                <TableCell className="font-mono text-sm text-zinc-400">23 cm</TableCell>
              </TableRow>
              <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-display font-bold text-lg text-accent">L</TableCell>
                <TableCell className="font-mono text-sm text-zinc-400">58 cm</TableCell>
                <TableCell className="font-mono text-sm text-zinc-400">74 cm</TableCell>
                <TableCell className="font-mono text-sm text-zinc-400">24 cm</TableCell>
              </TableRow>
              <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-display font-bold text-lg text-accent">XL</TableCell>
                <TableCell className="font-mono text-sm text-zinc-400">60 cm</TableCell>
                <TableCell className="font-mono text-sm text-zinc-400">76 cm</TableCell>
                <TableCell className="font-mono text-sm text-zinc-400">25 cm</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="mt-8 p-4 bg-white/5 border border-white/10 flex flex-col gap-2">
            <h4 className="font-display text-sm font-bold uppercase tracking-widest text-accent">¿Cómo medirme?</h4>
            <p className="font-sans text-xs text-zinc-400 uppercase tracking-widest leading-loose">
              1. <b>Ancho:</b> Mide de axila a axila.<br/>
              2. <b>Largo:</b> Mide desde el punto más alto del hombro hasta el borde inferior.<br/>
              Nuestras prendas tienen un calce <b>OVERSIZE</b>. Si prefieres un ajuste más apegado, elige una talla menos.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
