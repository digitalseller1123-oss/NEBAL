import { prisma } from '@/lib/prisma';
import { EstrategiaSalida, Presentacion, TipoCafe } from '@prisma/client';

/**
 * Selecciona el/los lote(s) de producto terminado de donde descontar una
 * venta, respetando la estrategia configurada (FIFO o lote más fresco)
 * por presentación/tipo. Si un solo lote no alcanza, divide entre varios.
 */
export async function seleccionarLotesParaVenta(
  presentacion: Presentacion,
  tipo: TipoCafe,
  cantidadRequerida: number
) {
  const config = await prisma.configProducto.findUnique({
    where: { presentacion_tipo: { presentacion, tipo } },
  });

  const estrategia = config?.estrategiaSalida ?? EstrategiaSalida.FIFO;
  const orden = estrategia === EstrategiaSalida.FIFO ? 'asc' : 'desc';

  const lotes = await prisma.loteProductoTerminado.findMany({
    where: { presentacion, tipo, cantidadDisponible: { gt: 0 } },
    orderBy: { fechaEmpaque: orden },
  });

  const asignaciones: { loteId: string; cantidad: number }[] = [];
  let restante = cantidadRequerida;

  for (const lote of lotes) {
    if (restante <= 0) break;
    const tomar = Math.min(lote.cantidadDisponible, restante);
    asignaciones.push({ loteId: lote.id, cantidad: tomar });
    restante -= tomar;
  }

  if (restante > 0) {
    throw new Error(`Inventario insuficiente: faltan ${restante} unidades de ${presentacion} ${tipo}`);
  }

  return asignaciones;
}

export async function aplicarDescuentoInventario(
  ventaId: string,
  presentacion: Presentacion,
  tipo: TipoCafe,
  cantidad: number,
  precioUnitario: number
) {
  return prisma.$transaction(async (tx) => {
    const asignaciones = await seleccionarLotesParaVenta(presentacion, tipo, cantidad);

    for (const { loteId, cantidad: cant } of asignaciones) {
      await tx.loteProductoTerminado.update({
        where: { id: loteId },
        data: { cantidadDisponible: { decrement: cant } },
      });

      await tx.itemVenta.create({
        data: {
          ventaId,
          loteProductoId: loteId,
          cantidad: cant,
          precioUnitario,
          subtotal: cant * precioUnitario,
        },
      });
    }

    return asignaciones;
  });
}
