'use client';

import { useEffect, useState } from 'react';

type Proveedor = {
  id: string;
  nombre: string;
  finca?: string;
  municipio?: string;
  departamento?: string;
  telefono?: string;
};

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', finca: '', municipio: '', departamento: '', telefono: '' });

  async function cargar() {
    const data = await fetch('/api/proveedores').then((r) => r.json());
    setProveedores(data);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/proveedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setForm({ nombre: '', finca: '', municipio: '', departamento: '', telefono: '' });
      cargar();
    } else {
      alert('Error al guardar proveedor');
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Proveedores y fincas</h1>
      <p className="mb-8 text-sm text-neutral-400">Origen de cada lote de café pergamino.</p>

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
            <label className="mb-1 block text-xs text-neutral-400">Finca</label>
            <input
              className="input"
              value={form.finca}
              onChange={(e) => setForm({ ...form, finca: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Municipio</label>
              <input
                className="input"
                value={form.municipio}
                onChange={(e) => setForm({ ...form, municipio: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Departamento</label>
              <input
                className="input"
                value={form.departamento}
                onChange={(e) => setForm({ ...form, departamento: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Teléfono</label>
            <input
              className="input"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>
          <button disabled={loading} className="btn-primary mt-2">
            {loading ? 'Guardando...' : 'Agregar proveedor'}
          </button>
        </form>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626] text-left text-neutral-400">
                <th className="pb-2">Nombre</th>
                <th className="pb-2">Finca</th>
                <th className="pb-2">Ubicación</th>
                <th className="pb-2">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id} className="border-b border-[#1a1a1a]">
                  <td className="py-2">{p.nombre}</td>
                  <td className="py-2">{p.finca || '—'}</td>
                  <td className="py-2">
                    {[p.municipio, p.departamento].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-2">{p.telefono || '—'}</td>
                </tr>
              ))}
              {proveedores.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-neutral-500">
                    Aún no hay proveedores registrados.
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
