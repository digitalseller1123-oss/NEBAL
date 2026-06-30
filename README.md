# NEBAL Café — ERP (Fase 1 completa: Núcleo operativo)

ERP de trazabilidad, inventario, producción y finanzas para NEBAL Café.

Stack: Next.js 14 (App Router) + TypeScript + TailwindCSS + Prisma + PostgreSQL.

## Módulos incluidos (todos funcionales: API + UI)

1. **Proveedores** — registro de fincas/proveedores de café pergamino.
2. **Compras** — compra de café pergamino, origina cada lote.
3. **Tostión** — envío a la empresa tostadora, costos, estado (pendiente/en proceso/entregado/cancelado).
4. **Recepción** — bolsas de 2.5kg recibidas por lote, cálculo automático del costo real por kg.
5. **Empaque** — abre bolsas de 2.5kg, genera presentaciones (125/250/500g, molido/grano), valida el rendimiento esperado vs real y alerta si la diferencia supera ±5%.
6. **Inventario** — disponible, valorizado, y trazabilidad completa por lote (click en una fila).
7. **Ventas** — descuento automático de inventario respetando la estrategia configurable por producto (FIFO o lote más fresco).
8. **Clientes** — historial y valor comprado.
9. **Dashboard** — KPIs en vivo: ventas del mes, utilidad del mes, inventario valorizado, lotes activos.

## 1. Correr en local

```bash
npm install
cp .env.example .env   # pega tu DATABASE_URL real
npx prisma migrate dev --name init
npm run dev
```

Abre http://localhost:3000

## 2. Subir a GitHub

```bash
git init
git add .
git commit -m "NEBAL ERP - Fase 1 completa"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/nebal-erp.git
git push -u origin main
```

## 3. Base de datos en Render

1. En Render: **New → PostgreSQL** (o usa el `render.yaml` incluido con "New → Blueprint").
2. Copia la **External Database URL** (la app vive en Vercel, no en Render).

## 4. Desplegar la app en Vercel

1. **New Project → Import** tu repo de GitHub. Next.js se detecta automáticamente.
2. En **Environment Variables** agrega `DATABASE_URL` con la External Database URL de Render.
3. Deploy.
4. Corre las migraciones una sola vez apuntando a producción:

```bash
DATABASE_URL="tu_external_url_de_render" npx prisma migrate deploy
```

## 5. Orden recomendado de uso real

Proveedores → Compras → Tostión → Recepción → Empaque → (ya queda en Inventario) → Ventas (requiere Clientes creados primero).

## Qué falta para el ERP completo original

Las funcionalidades de gastos/ingresos/flujo de caja, costeo avanzado y estado de resultados (Módulos 10–16), trazabilidad documental (18), reportes exportables (19), calendario (20), alertas proactivas (21), proyecciones (23), asistente de IA (24) y roles/auditoría (25) quedaron fuera de esta Fase 1 a propósito, para entregar primero un núcleo operativo sólido y probado con datos reales. Dime cuál de estos quieres que construya a continuación.
