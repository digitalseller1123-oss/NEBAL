'use client';

import { useEffect, useState } from 'react';

type Orden = {
  id: string;
  estado: string;
  empresaTostadora: string;
  compra: { codigoLoteInterno: string };
};
type Recepcion = {
  id: string;
  fechaRecepcion: string;
  cantidadRecibidaKg: string;
  bolsasTotales: number;
  bolsasAbiertas: number;
  costoRealKg: string;
  ordenTostion: { compra: { codigoLoteInterno: string }; empresaTostadora: string };
};

export default function RecepcionPage() {
  const [recepciones, setRecepciones] = useState<Recepcion[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ordenTostionId: '',
    fechaRecepcion: new Date().toISOString().slice(0, 10),
    cantidadRecibidaKg: '',
    bolsasTotales: '',
    mermaPct: '',
    fechaVencimiento: '',
    observaciones: '',
  });

  async function cargar() {
    const [r, o] = await Promise.all([
      fetch('/api/recepciones').then((r) => r.json()),
      fetch('/api/tostion').then((r) => r.json()),
    ]);
    setRecepciones(r);
    setOrdenes(o.filter((x: Orden) => !x['recepcion' as any]));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/recepciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setForm({ ...form, cantidadRecibidaKg: '', bolsasTotales: '', mermaPct: '', observaciones: '' });
      cargar();
    } else {
      const err = await res.json();
      alert('Error: ' + JSON.stringify(err.error));
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Recepción del café tostado</h1>
      <p className="mb-8 text-sm text-neutral-400">
        Cada bolsa recibida pesa 2.5kg. Se registra por contador, no individualmente.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={onSubmit} className="card flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Orden de tostión</label>
            <select
              required
              className="input"
              value={form.ordenTostionId}
              onChange={(e) => setForm({ ...form, ordenTostionId: e.target.value })}
            >
              <option value="">Selecciona...</option>
              {ordenes.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.compra.codigoLoteInterno} — {o.empresaTostadora} ({o.estado})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Fecha de recepción</label>
            <input
              type="date"
              required
              className="input"
              value={form.fechaRecepcion}
              onChange={(e) => setForm({ ...form, fechaRecepcion: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Kg recibidos</label>
              <input
                type="number"
                step="0.01"
                required
                className="input"
                value={form.cantidadRecibidaKg}
                onChange={(e) => setForm({ ...form, cantidadRecibidaKg: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Bolsas de 2.5kg</label>
              <input
                type="number"
                required
                className="input"
                value={form.bolsasTotales}
                onChange={(e) => setForm({ ...form, bolsasTotales: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-400">% merma</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={form.mermaPct}
                onChange={(e) => setForm({ ...form, mermaPct: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Vencimiento</label>
              <input
                type="date"
                className="input"
                value={form.fechaVencimiento}
                onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
              />
            </div>
          </div>
          <button disabled={loading} className="btn-primary mt-2">
            {loading ? 'Guardando...' : 'Registrar recepción'}
          </button>
        </form>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626] text-left text-neutral-400">
                <th className="pb-2">Lote</th>
                <th className="pb-2">Tostadora</th>
                <th className="pb-2">Kg</th>
                <th className="pb-2">Bolsas</th>
                <th className="pb-2">Costo real/kg</th>
              </tr>
            </thead>
            <tbody>
              {recepciones.map((r) => (
                <tr key={r.id} className="border-b border-[#1a1a1a]">
                  <td className="py-2 font-mono text-xs">{r.ordenTostion.compra.codigoLoteInterno}</td>
                  <td className="py-2">{r.ordenTostion.empresaTostadora}</td>
                  <td className="py-2">{r.cantidadRecibidaKg}</td>
                  <td className="py-2">
                    {r.bolsasAbiertas}/{r.bolsasTotales}
                  </td>
                  <td className="py-2">${Number(r.costoRealKg).toLocaleString('es-CO')}</td>
                </tr>
              ))}
              {recepciones.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-500">
                    Aún no hay recepciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
