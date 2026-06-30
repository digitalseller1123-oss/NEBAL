'use client';

import { useEffect, useState } from 'react';

export default function InventarioPage() {
  const [lotes, setLotes] = useState<any[]>([]);
  const [abierto, setAbierto] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/inventario')
      .then((r) => r.json())
      .then(setLotes);
  }, []);

  const valorTotal = lotes.reduce((sum, l) => sum + Number(l.costoUnitario) * l.cantidadDisponible, 0);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Inventario de producto terminado</h1>
      <p className="mb-8 text-sm text-neutral-400">
        Disponible por lote y presentación. Click en una fila para ver la trazabilidad completa.
      </p>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs text-neutral-400">Lotes activos</div>
          <div className="mt-1 text-2xl font-semibold">{lotes.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-neutral-400">Unidades disponibles</div>
          <div className="mt-1 text-2xl font-semibold">
            {lotes.reduce((s, l) => s + l.cantidadDisponible, 0)}
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-neutral-400">Inventario valorizado</div>
          <div className="mt-1 text-2xl font-semibold">${valorTotal.toLocaleString('es-CO')}</div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#262626] text-left text-neutral-400">
              <th className="pb-2">Presentación</th>
              <th className="pb-2">Tipo</th>
              <th className="pb-2">Disponible</th>
              <th className="pb-2">Costo unit.</th>
              <th className="pb-2">Empacado</th>
              <th className="pb-2">Vence</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map((l) => (
              <>
                <tr
                  key={l.id}
                  className="cursor-pointer border-b border-[#1a1a1a] hover:bg-[#1a1a1a]"
                  onClick={() => setAbierto(abierto === l.id ? null : l.id)}
                >
                  <td className="py-2">{l.presentacion.replace('G', '')}g</td>
                  <td className="py-2">{l.tipo}</td>
                  <td className="py-2">{l.cantidadDisponible}</td>
                  <td className="py-2">${Number(l.costoUnitario).toLocaleString('es-CO')}</td>
                  <td className="py-2">{new Date(l.fechaEmpaque).toLocaleDateString('es-CO')}</td>
                  <td className="py-2">
                    {l.fechaVencimiento ? new Date(l.fechaVencimiento).toLocaleDateString('es-CO') : '—'}
                  </td>
                </tr>
                {abierto === l.id && (
                  <tr className="bg-[#0f0f0f]">
                    <td colSpan={6} className="px-4 py-3 text-xs text-neutral-400">
                      <strong className="text-neutral-300">Trazabilidad:</strong>{' '}
                      Proveedor {l.eventoEmpaque?.recepcion?.ordenTostion?.compra?.proveedor?.nombre} → Lote{' '}
                      {l.eventoEmpaque?.recepcion?.ordenTostion?.compra?.codigoLoteInterno} → Tostadora{' '}
                      {l.eventoEmpaque?.recepcion?.ordenTostion?.empresaTostadora} → Recepción{' '}
                      {new Date(l.eventoEmpaque?.recepcion?.fechaRecepcion).toLocaleDateString('es-CO')} → Empaque{' '}
                      {new Date(l.eventoEmpaque?.fecha).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                )}
              </>
            ))}
            {lotes.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-neutral-500">
                  Aún no hay producto terminado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
