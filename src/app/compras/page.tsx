'use client';

import { useEffect, useState } from 'react';

type Proveedor = { id: string; nombre: string };
type Compra = {
  id: string;
  fecha: string;
  cantidadKg: string;
  precioKg: string;
  costoTotal: string;
  codigoLoteInterno: string;
  proveedor: Proveedor;
};

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    proveedorId: '',
    fecha: new Date().toISOString().slice(0, 10),
    cantidadKg: '',
    precioKg: '',
    variedad: '',
    proceso: '',
    altura: '',
    humedad: '',
    codigoLoteInterno: '',
    observaciones: '',
  });

  async function cargar() {
    const [c, p] = await Promise.all([
      fetch('/api/compras').then((r) => r.json()),
      fetch('/api/proveedores').then((r) => r.json()),
    ]);
    setCompras(c);
    setProveedores(p);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/compras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setForm({ ...form, cantidadKg: '', precioKg: '', codigoLoteInterno: '', observaciones: '' });
      cargar();
    } else {
      const err = await res.json();
      alert('Error: ' + JSON.stringify(err.error));
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Compras de café pergamino</h1>
      <p className="mb-8 text-sm text-neutral-400">
        Punto de entrada de la trazabilidad: cada compra origina un lote.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={onSubmit} className="card flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Proveedor</label>
            <select
              required
              className="input"
              value={form.proveedorId}
              onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}
            >
              <option value="">Selecciona...</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            {proveedores.length === 0 && (
              <p className="mt-1 text-xs text-amber-500">
                No hay proveedores aún. Créalos primero vía POST /api/proveedores.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-400">Fecha</label>
            <input
              type="date"
              required
              className="input"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Cantidad (kg)</label>
              <input
                type="number"
                step="0.01"
                required
                className="input"
                value={form.cantidadKg}
                onChange={(e) => setForm({ ...form, cantidadKg: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Precio / kg</label>
              <input
                type="number"
                step="0.01"
                required
                className="input"
                value={form.precioKg}
                onChange={(e) => setForm({ ...form, precioKg: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-400">Código de lote interno</label>
            <input
              required
              className="input"
              placeholder="P24001"
              value={form.codigoLoteInterno}
              onChange={(e) => setForm({ ...form, codigoLoteInterno: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Variedad</label>
              <input
                className="input"
                value={form.variedad}
                onChange={(e) => setForm({ ...form, variedad: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Proceso</label>
              <input
                className="input"
                value={form.proceso}
                onChange={(e) => setForm({ ...form, proceso: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-400">Observaciones</label>
            <textarea
              className="input"
              rows={2}
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
            />
          </div>

          <button disabled={loading} className="btn-primary mt-2">
            {loading ? 'Guardando...' : 'Registrar compra'}
          </button>
        </form>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626] text-left text-neutral-400">
                <th className="pb-2">Lote</th>
                <th className="pb-2">Proveedor</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Kg</th>
                <th className="pb-2">Costo total</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c) => (
                <tr key={c.id} className="border-b border-[#1a1a1a]">
                  <td className="py-2 font-mono text-xs">{c.codigoLoteInterno}</td>
                  <td className="py-2">{c.proveedor?.nombre}</td>
                  <td className="py-2">{new Date(c.fecha).toLocaleDateString('es-CO')}</td>
                  <td className="py-2">{c.cantidadKg}</td>
                  <td className="py-2">${Number(c.costoTotal).toLocaleString('es-CO')}</td>
                </tr>
              ))}
              {compras.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-500">
                    Aún no hay compras registradas.
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
