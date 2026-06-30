'use client';

import { useEffect, useState } from 'react';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', telefono: '', correo: '', ciudad: '' });

  async function cargar() {
    const data = await fetch('/api/clientes').then((r) => r.json());
    setClientes(data);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setForm({ nombre: '', telefono: '', correo: '', ciudad: '' });
      cargar();
    } else {
      alert('Error al guardar cliente');
    }
  }

  function valorComprado(cliente: any) {
    return cliente.ventas.reduce(
      (sum: number, v: any) => sum + v.items.reduce((s: number, i: any) => s + Number(i.subtotal), 0),
      0
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Clientes</h1>
      <p className="mb-8 text-sm text-neutral-400">Historial y valor comprado por cliente.</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={onSubmit} className="card flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Nombre</label>
            <input
              required
              className="input"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Teléfono</label>
            <input
              className="input"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Correo</label>
            <input
              className="input"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Ciudad</label>
            <input
              className="input"
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            />
          </div>
          <button disabled={loading} className="btn-primary mt-2">
            {loading ? 'Guardando...' : 'Agregar cliente'}
          </button>
        </form>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626] text-left text-neutral-400">
                <th className="pb-2">Nombre</th>
                <th className="pb-2">Ciudad</th>
                <th className="pb-2">Compras</th>
                <th className="pb-2">Valor comprado</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-[#1a1a1a]">
                  <td className="py-2">{c.nombre}</td>
                  <td className="py-2">{c.ciudad || '—'}</td>
                  <td className="py-2">{c.ventas.length}</td>
                  <td className="py-2">${valorComprado(c).toLocaleString('es-CO')}</td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-neutral-500">
                    Aún no hay clientes registrados.
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
