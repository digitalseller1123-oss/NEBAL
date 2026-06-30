'use client';

import { useEffect, useState } from 'react';

type Proveedor = { id: string; nombre: string; tipo: string };
type Compra = {
  id: string;
  fecha: string;
  tipoInsumo: string;
  cantidadKg: string;
  precioKg: string;
  costoTotal: string;
  codigoLoteInterno: string;
  proveedor: Proveedor;
};

const TIPOS_INSUMO = [
  { value: 'cafe_pergamino', label: 'Café pergamino' },
  { value: 'empaques', label: 'Empaques / bolsas' },
  { value: 'etiquetas', label: 'Etiquetas' },
  { value: 'otro', label: 'Otro insumo' },
];

function tipoLabel(value: string) {
  return TIPOS_INSUMO.find((t) => t.value === value)?.label || value;
}

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    proveedorId: '',
    tipoInsumo: 'cafe_pergamino',
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

  const esCafe = form.tipoInsumo === 'cafe_pergamino';
  const proveedoresDelTipo = proveedores.filter((p) => p.tipo === form.tipoInsumo);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Compras</h1>
      <p className="mb-8 text-sm text-neutral-400">
        Registra compras de café, empaques, etiquetas o cualquier otro insumo. Cada compra de café origina un lote para trazabilidad.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={onSubmit} className="card flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Tipo de insumo</label>
            <select
              className="input"
              value={form.tipoInsumo}
              onChange={(e) => setForm({ ...form, tipoInsumo: e.target.value, proveedorId: '' })}
            >
              {TIPOS_INSUMO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-400">Proveedor</label>
            <select
              required
              className="input"
              value={form.proveedorId}
              onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}
            >
              <option value="">Selecciona...</option>
              {proveedoresDelTipo.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            {proveedoresDelTipo.length === 0 && (
              <p className="mt-1 text-xs text-amber-500">
                No hay proveedores de este tipo aún. Créalo primero en Proveedores.
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
              <label className="mb-1 block text-xs text-neutral-400">
                {esCafe ? 'Cantidad (kg)' : 'Cantidad'}
              </label>
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
              <label className="mb-1 block text-xs text-neutral-400">Precio unitario</label>
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
            <label className="mb-1 block text-xs text-neutral-400">Código de lote / referencia interna</label>
            <input
              required
              className="input"
              placeholder={esCafe ? 'P24001' : 'E24001'}
              value={form.codigoLoteInterno}
              onChange={(e) => setForm({ ...form, codigoLoteInterno: e.target.value })}
            />
          </div>

          {esCafe && (
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
          )}

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
                <th className="pb-2">Lote / Ref.</th>
                <th className="pb-2">Tipo</th>
                <th className="pb-2">Proveedor</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Cantidad</th>
                <th className="pb-2">Costo total</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c) => (
                <tr key={c.id} className="border-b border-[#1a1a1a]">
                  <td className="py-2 font-mono text-xs">{c.codigoLoteInterno}</td>
                  <td className="py-2">{tipoLabel(c.tipoInsumo)}</td>
                  <td className="py-2">{c.proveedor?.nombre}</td>
                  <td className="py-2">{new Date(c.fecha).toLocaleDateString('es-CO')}</td>
                  <td className="py-2">{c.cantidadKg}</td>
                  <td className="py-2">${Number(c.costoTotal).toLocaleString('es-CO')}</td>
                </tr>
              ))}
              {compras.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-neutral-500">
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
