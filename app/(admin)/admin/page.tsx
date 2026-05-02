// MOCK DATA: Esto vendrá de Drizzle ORM (estadísticas básicas)
export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-12">
      <h1 className="text-4xl font-display font-bold uppercase tracking-widest text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Ventas Mensuales', value: '$1.2M', info: '+12% este mes' },
          { title: 'Órdenes Nuevas', value: '45', info: 'Pendientes de envío' },
          { title: 'Productos Activos', value: '18', info: 'Catálogo' },
          { title: 'Bajo Stock', value: '3', info: 'Variantes con < 5' }
        ].map((stat, i) => (
          <div key={i} className="p-6 border border-white/10 bg-[#111111]">
            <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">{stat.title}</h3>
            <p className="text-4xl font-display font-bold text-accent mb-2">{stat.value}</p>
            <p className="font-sans text-xs text-white/50">{stat.info}</p>
          </div>
        ))}
      </div>
      
      <div className="p-6 border border-white/10 bg-[#111111] h-[400px] flex items-center justify-center">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Gráfico de Ventas (Aquí se integrará una librería de charts)
        </p>
      </div>
    </div>
  );
}
