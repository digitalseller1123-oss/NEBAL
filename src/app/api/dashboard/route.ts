import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [ventasMes, lotesProducto, recepciones] = await Promise.all([
    prisma.venta.findMany({
      where: { fecha: { gte: inicioMes } },
      include: { items: true },
    }),
    prisma.loteProductoTerminado.findMany(),
    prisma.recepcionTostado.findMany(),
  ]);

  const ventasTotalMes = ventasMes.reduce(
    (sum, v) => sum + v.items.reduce((s, i) => s + Number(i.subtotal), 0),
    0
  );

  const costoVentasMes = await prisma.itemVenta.findMany({
    where: { venta: { fecha: { gte: inicioMes } } },
    include: { loteProducto: true },
  });
  const costoTotalMes = costoVentasMes.reduce(
    (sum, i) => sum + Number(i.loteProducto.costoUnitario) * i.cantidad,
    0
  );

  const utilidadMes = ventasTotalMes - costoTotalMes;

  const inventarioValorizado = lotesProducto.reduce(
    (sum, l) => sum + Number(l.costoUnitario) * l.cantidadDisponible,
    0
  );

  const lotesActivos = recepciones.filter((r) => r.bolsasAbiertas < r.bolsasTotales).length;

  return NextResponse.json({
    ventasTotalMes,
    utilidadMes,
    inventarioValorizado,
    lotesActivos,
  });
}
