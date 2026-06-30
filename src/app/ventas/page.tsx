'use client';

import { useEffect, useState } from 'react';

type ItemForm = { presentacion: 'G125' | 'G250' | 'G500'; tipo: 'MOLIDO' | 'GRANO'; cantidad: string; precioUnitario: string };

const PRESENTACIONES = ['G125', 'G250', 'G500'] as const;
const TIPOS = ['MOLIDO', 'GRANO'] as const;
const CANALES = ['TIENDA', 'WHATSAPP', 'INSTAGRAM', 'PAGINA_WEB', 'DISTRIBUIDOR', 'EVENTO'] as const;
const METODOS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] as const;

export default function VentasPage() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [canal, setCanal] = useState<(typeof CANALES)[number]>('TIENDA');
  const [metodoPago, setMetodoPago] = useState<(typeof METODOS)[number]>('EFECTIVO');
  const [items, setItems] = useState<ItemForm[]>([
    { presentacion: 'G250', tipo: 'MOLIDO', cantidad: '', precioUnitario: '' },
  ]);

  async function cargar() {
    const [v, c] = await Promise.all([
      fetch('/api/ventas').then((r) => r.json()),
      fetch('/api/clientes').then((r) => r.json()),
    ]);
    setVentas(v);
    setClientes(c);
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
    const res = await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteId, fecha, canal, metodoPago, items }),
    });
    setLoading(false);
    const json = await res.json();
    if (res.ok) {
      setItems([{ presentacion: 'G250', tipo: 'MOLIDO', cantidad: '', precioUnitario: '' }]);
      cargar();
    } else {
      alert('Error: ' + (json.error || JSON.stringify(json)));
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Ventas</h1>
      <p className="mb-8 text-sm text-neutral-400">
        El inventario se descuenta automáticamente según la estrategia configurada por producto (FIFO o lote más fresco).
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        <form onSubmit={onSubmit} className="card flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Cliente</label>
            <select required className="input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Selecciona...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
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
              <label className="mb-1 block text-xs text-neutral-400">Canal</label>
              <select className="input" value={canal} onChange={(e) => setCanal(e.target.value as any)}>
                {CANALES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Método de pago</label>
            <select className="input" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as any)}>
              {METODOS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 text-xs font-medium text-neutral-400">Productos</div>
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2">
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
                placeholder="Cant."
                className="input"
                value={item.cantidad}
                onChange={(e) => actualizarItem(idx, 'cantidad', e.target.value)}
              />
              <input
                type="number"
                placeholder="Precio"
                className="input"
                value={item.precioUnitario}
                onChange={(e) => actualizarItem(idx, 'precioUnitario', e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            className="text-left text-xs text-accent"
            onClick={() =>
              setItems([...items, { presentacion: 'G250', tipo: 'MOLIDO', cantidad: '', precioUnitario: '' }])
            }
          >
            + agregar otro producto
          </button>

          <button disabled={loading} className="btn-primary mt-2">
            {loading ? 'Guardando...' : 'Registrar venta'}
          </button>
        </form>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626] text-left text-neutral-400">
                <th className="pb-2">Cliente</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Canal</th>
                <th className="pb-2">Items</th>
                <th className="pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id} className="border-b border-[#1a1a1a]">
                  <td className="py-2">{v.cliente?.nombre}</td>
                  <td className="py-2">{new Date(v.fecha).toLocaleDateString('es-CO')}</td>
                  <td className="py-2">{v.canal}</td>
                  <td className="py-2">{v.items.length}</td>
                  <td className="py-2">
                    ${v.items.reduce((s: number, i: any) => s + Number(i.subtotal), 0).toLocaleString('es-CO')}
                  </td>
                </tr>
              ))}
              {ventas.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-500">
                    Aún no hay ventas registradas.
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
