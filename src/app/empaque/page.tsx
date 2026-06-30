'use client';

import { useEffect, useState } from 'react';

type Recepcion = {
  id: string;
  bolsasTotales: number;
  bolsasAbiertas: number;
  ordenTostion: { compra: { codigoLoteInterno: string } };
};

type ItemForm = { presentacion: 'G125' | 'G250' | 'G500'; tipo: 'MOLIDO' | 'GRANO'; cantidadUnidades: string };

const PRESENTACIONES = ['G125', 'G250', 'G500'] as const;
const TIPOS = ['MOLIDO', 'GRANO'] as const;

export default function EmpaquePage() {
  const [recepciones, setRecepciones] = useState<Recepcion[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recepcionId, setRecepcionId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [operario, setOperario] = useState('');
  const [bolsasUsadas, setBolsasUsadas] = useState('');
  const [items, setItems] = useState<ItemForm[]>([{ presentacion: 'G250', tipo: 'MOLIDO', cantidadUnidades: '' }]);

  async function cargar() {
    const [r, e] = await Promise.all([
      fetch('/api/recepciones').then((r) => r.json()),
      fetch('/api/empaque').then((r) => r.json()),
    ]);
    setRecepciones(r);
    setEventos(e);
  }

  useEffect(() => {
    cargar();
  }, []);

  function actualizarItem(idx: number, campo: keyof ItemForm, valor: string) {
    const copia = [...items];
    (copia[idx] as any)[campo] = valor;
    setItems(copia);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/empaque', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recepcionId,
        fecha,
        operario,
        bolsas25kgUsadas: bolsasUsadas,
        items: items.map((i) => ({ ...i, cantidadUnidades: i.cantidadUnidades })),
      }),
    });
    setLoading(false);
    const json = await res.json();
    if (res.ok) {
      if (json.alerta) alert('⚠ ' + json.alerta);
      setBolsasUsadas('');
      setItems([{ presentacion: 'G250', tipo: 'MOLIDO', cantidadUnidades: '' }]);
      cargar();
    } else {
      alert('Error: ' + JSON.stringify(json.error));
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Empaque</h1>
      <p className="mb-8 text-sm text-neutral-400">
        Abre bolsas de 2.5kg y genera presentaciones comerciales. El sistema valida el rendimiento automáticamente.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        <form onSubmit={onSubmit} className="card flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Lote (recepción)</label>
            <select required className="input" value={recepcionId} onChange={(e) => setRecepcionId(e.target.value)}>
              <option value="">Selecciona...</option>
              {recepciones.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.ordenTostion.compra.codigoLoteInterno} — disponibles {r.bolsasTotales - r.bolsasAbiertas}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Fecha</label>
              <input type="date" required className="input" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">Operario</label>
              <input className="input" value={operario} onChange={(e) => setOperario(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Bolsas de 2.5kg a abrir</label>
            <input
              type="number"
              step="0.5"
              required
              className="input"
              value={bolsasUsadas}
              onChange={(e) => setBolsasUsadas(e.target.value)}
            />
          </div>

          <div className="mt-2 text-xs font-medium text-neutral-400">Presentaciones a generar</div>
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <select
                className="input"
                value={item.presentacion}
                onChange={(e) => actualizarItem(idx, 'presentacion', e.target.value)}
              >
                {PRESENTACIONES.map((p) => (
                  <option key={p} value={p}>
                    {p.replace('G', '')}g
                  </option>
                ))}
              </select>
              <select className="input" value={item.tipo} onChange={(e) => actualizarItem(idx, 'tipo', e.target.value)}>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Unidades"
                className="input"
                value={item.cantidadUnidades}
                onChange={(e) => actualizarItem(idx, 'cantidadUnidades', e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            className="text-left text-xs text-accent"
            onClick={() => setItems([...items, { presentacion: 'G250', tipo: 'MOLIDO', cantidadUnidades: '' }])}
          >
            + agregar otra presentación
          </button>

          <button disabled={loading} className="btn-primary mt-2">
            {loading ? 'Guardando...' : 'Registrar empaque'}
          </button>
        </form>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626] text-left text-neutral-400">
                <th className="pb-2">Lote</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Bolsas usadas</th>
                <th className="pb-2">Diferencia rendimiento</th>
                <th className="pb-2">Presentaciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((ev) => (
                <tr key={ev.id} className="border-b border-[#1a1a1a]">
                  <td className="py-2 font-mono text-xs">
                    {ev.recepcion?.ordenTostion?.compra?.codigoLoteInterno}
                  </td>
                  <td className="py-2">{new Date(ev.fecha).toLocaleDateString('es-CO')}</td>
                  <td className="py-2">{ev.bolsas25kgUsadas}</td>
                  <td className={`py-2 ${Math.abs(Number(ev.diferenciaPct)) > 5 ? 'text-amber-500' : ''}`}>
                    {Number(ev.diferenciaPct).toFixed(1)}%
                  </td>
                  <td className="py-2">{ev.lotesProducto?.length ?? 0} lote(s)</td>
                </tr>
              ))}
              {eventos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-500">
                    Aún no hay empaques registrados.
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
