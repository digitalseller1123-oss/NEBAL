import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NEBAL Café — ERP',
  description: 'Trazabilidad, inventario, producción y finanzas',
};

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/proveedores', label: 'Proveedores' },
  { href: '/compras', label: 'Compras' },
  { href: '/tostion', label: 'Tostión' },
  { href: '/recepcion', label: 'Recepción' },
  { href: '/empaque', label: 'Empaque' },
  { href: '/inventario', label: 'Inventario' },
  { href: '/ventas', label: 'Ventas' },
  { href: '/clientes', label: 'Clientes' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        <div className="flex min-h-screen">
          <aside className="w-56 shrink-0 border-r border-[#262626] p-4">
            <div className="mb-8 px-2 text-lg font-semibold tracking-tight">
              NEBAL <span className="text-accent">Café</span>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-[#1a1a1a] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
