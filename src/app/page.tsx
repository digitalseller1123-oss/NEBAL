'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setKpis);
  }, []);

  const cards = [
    { label: 'Ventas del mes', value: kpis ? `$${kpis.ventasTotalMes.toLocaleString('es-CO')}` : '—' },
    { label: 'Utilidad del mes', value: kpis ? `$${kpis.utilidadMes.toLocaleString('es-CO')}` : '—' },
    { label: 'Inventario valorizado', value: kpis ? `$${kpis.inventarioValorizado.toLocaleString('es-CO')}` : '—' },
    { label: 'Lotes activos', value: kpis ? kpis.lotesActivos : '—' },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Dashboard</h1>
      <p className="mb-8 text-sm text-neutral-400">
        KPIs calculados en vivo desde compras, empaque y ventas registradas.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="text-xs text-neutral-400">{c.label}</div>
            <div className="mt-2 text-2xl font-semibold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card mt-6 text-sm text-neutral-400">
        Pronósticos, alertas de vencimiento, rotación de productos y el asistente de IA llegan en la Fase 3
        del proyecto, una vez haya suficiente historial de compras y ventas reales.
      </div>
    </div>
  );
}
