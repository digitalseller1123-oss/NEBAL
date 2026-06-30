'use client';

import { useEffect, useState } from 'react';

type Compra = { id: string; codigoLoteInterno: string; cantidad: string; proveedor: { nombre: string } };
type Orden = {
  id: string;
  fechaEnvio: string;
  empresaTostadora: string;
  cantidadEnviadaKg: string;
  estado: string;
  numeroOrden?: string;
  compra: Compra;
  recepcion: any;
};

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'ENTREGADO', 'CANCELADO'];

export default function TostionPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    compraId: '',
    fechaEnvio: new Date().toISOString().slice(0, 10),
    empresaTostadora: '',
    cantidadEnviadaKg: '',
    numeroOrden: '',
    costoTostion: '',
    costoMolienda: '',
    costoTransporte: '',
  });

  async function cargar() {
    const [o, c] = await Promise.all([
      fetch('/api/tostion').then((r) => r.json()),
      fetch('/api/compras').then((r) => r.json()),
    ]);
    setOrdenes(o);
    setCompras(c);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/tostion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setForm({ ...form, cantidadEnviadaKg: '', numeroOrden: '', costoTostion: '', costoMolienda: '', costoTransporte: '' });
      cargar();
    } else {
      const err = await res.json();
      alert('Error: ' + JSON.stringify(err.error));
    }
  }

  async function cambiarEstado(id: string, estado: string) {
    await fetch(`/api/tostion/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    cargar();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Órdenes de tostión</h1>
      <p className="mb-8 text-sm text-neutral-400">Envío del pergamino a la empresa tostadora.</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={onSubmit} className="card flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Compra / lote origen</label>
            <select
              required
              className="input"
              value={form.compraId}
              onChange={(e) => setForm({ ...form, compraId: e.target.value })}
            >
              <option value="">Selecciona...</option>
              {compras.filter((c) => c.tipoInsumo === 'cafe_pergamino').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigoLoteInterno} — {c.proveedor.nombre} ({c.cantidadKg}kg)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Fecha de envío</label>
            <input
              type="date"
              required
              className="input"
              value={form.fechaEnvio}
              onChange={(e) => setForm({ ...form, fechaEnvio: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Empresa tostadora</label>
            <input
              required
              className="input"
              value={form.empresaTostadora}
              onChange={(e) => setForm({ ...form, empresaTostadora: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Cantidad enviada (kg)</label>
              <input
                type="number"
                step="0.01"
                required
                className="input"
                value={form.cantidadEnviadaKg}
                onChange={(e) => setForm({ ...form, cantidadEnviadaKg: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">N° de orden</label>
              <input
                className="input"
                value={form.numeroOrden}
                onChange={(e) => setForm({ ...form, numeroOrden: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Costo tostión</label>
              <input
                type="number"
                step="0.01"
                required
                className="input"
                value={form.costoTostion}
                onChange={(e) => setForm({ ...form, costoTostion: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Molienda</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={form.costoMolienda}
                onChange={(e) => setForm({ ...form, costoMolienda: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Transporte</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={form.costoTransporte}
                onChange={(e) => setForm({ ...form, costoTransporte: e.target.value })}
              />
            </div>
          </div>
          <button disabled={loading} className="btn-primary mt-2">
            {loading ? 'Guardando...' : 'Registrar orden'}
          </button>
        </form>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626] text-left text-neutral-400">
                <th className="pb-2">Lote</th>
                <th className="pb-2">Tostadora</th>
                <th className="pb-2">Enviado</th>
                <th className="pb-2">Kg</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => (
                <tr key={o.id} className="border-b border-[#1a1a1a]">
                  <td className="py-2 font-mono text-xs">{o.compra.codigoLoteInterno}</td>
                  <td className="py-2">{o.empresaTostadora}</td>
                  <td className="py-2">{new Date(o.fechaEnvio).toLocaleDateString('es-CO')}</td>
                  <td className="py-2">{o.cantidadEnviadaKg}</td>
                  <td className="py-2">
                    <select
                      className="input py-1 text-xs"
                      value={o.estado}
                      onChange={(e) => cambiarEstado(o.id, e.target.value)}
                    >
                      {ESTADOS.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {ordenes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-500">
                    Aún no hay órdenes de tostión.
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
