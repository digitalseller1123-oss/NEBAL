'use client';

import { useEffect, useState } from 'react';

type Proveedor = {
  id: string;
  nombre: string;
  tipo: string;
  finca?: string;
  municipio?: string;
  departamento?: string;
  telefono?: string;
  email?: string;
  notas?: string;
};

const TIPOS = [
  { value: 'cafe_pergamino', label: 'Café pergamino' },
  { value: 'empaques', label: 'Empaques / bolsas' },
  { value: 'etiquetas', label: 'Etiquetas' },
  { value: 'otro', label: 'Otro insumo' },
];

function tipoLabel(value: string) {
  return TIPOS.find((t) => t.value === value)?.label || value;
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'cafe_pergamino',
    finca: '',
    municipio: '',
    departamento: '',
    telefono: '',
    email: '',
    notas: '',
  });

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
      setForm({
        nombre: '',
        tipo: form.tipo,
        finca: '',
        municipio: '',
        departamento: '',
        telefono: '',
        email: '',
        notas: '',
      });
      cargar();
    } else {
      alert('Error al guardar proveedor');
    }
  }

  const proveedoresFiltrados =
    filtroTipo === 'todos' ? proveedores : proveedores.filter((p) => p.tipo === filtroTipo);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Proveedores</h1>
      <p className="mb-8 text-sm text-neutral-400">
        Fincas de café, proveedores de empaques, etiquetas y demás insumos.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={onSubmit} className="card flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Tipo de proveedor</label>
            <select
              className="input"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Nombre</label>
            <input
              required
              className="input"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          {form.tipo === 'cafe_pergamino' && (
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Finca</label>
              <input
                className="input"
                value={form.finca}
                onChange={(e) => setForm({ ...form, finca: e.target.value })}
              />
            </div>
          )}

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
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Email</label>
            <input
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Notas</label>
            <input
              className="input"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </div>
          <button disabled={loading} className="btn-primary mt-2">
            {loading ? 'Guardando...' : 'Agregar proveedor'}
          </button>
        </form>

        <div className="card overflow-x-auto">
          <div className="mb-3 flex items-center gap-2">
            <label className="text-xs text-neutral-400">Filtrar por tipo:</label>
            <select
              className="input w-auto"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="todos">Todos</option>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626] text-left text-neutral-400">
                <th className="pb-2">Nombre</th>
                <th className="pb-2">Tipo</th>
                <th className="pb-2">Finca</th>
                <th className="pb-2">Ubicación</th>
                <th className="pb-2">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {proveedoresFiltrados.map((p) => (
                <tr key={p.id} className="border-b border-[#1a1a1a]">
                  <td className="py-2">{p.nombre}</td>
                  <td className="py-2">{tipoLabel(p.tipo)}</td>
                  <td className="py-2">{p.finca || '—'}</td>
                  <td className="py-2">
                    {[p.municipio, p.departamento].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-2">{p.telefono || '—'}</td>
                </tr>
              ))}
              {proveedoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-500">
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
