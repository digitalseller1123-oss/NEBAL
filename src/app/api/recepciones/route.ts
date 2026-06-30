import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const recepcionSchema = z.object({
  ordenTostionId: z.string().uuid(),
  fechaRecepcion: z.string(),
  cantidadRecibidaKg: z.coerce.number().positive(),
  bolsasTotales: z.coerce.number().int().positive(),
  mermaPct: z.coerce.number().optional(),
  fechaVencimiento: z.string().optional(),
  observaciones: z.string().optional(),
});

export async function GET() {
  const recepciones = await prisma.recepcionTostado.findMany({
    include: { ordenTostion: { include: { compra: true } } },
    orderBy: { fechaRecepcion: 'desc' },
  });
  return NextResponse.json(recepciones);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = recepcionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const orden = await prisma.ordenTostion.findUnique({ where: { id: data.ordenTostionId } });
  if (!orden) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });

  // costo real por kg = (costo pergamino prorrateado + tostión + molienda + transporte) / kg recibidos
  const compra = await prisma.compraPergamino.findUnique({ where: { id: orden.compraId } });
  const costoPergaminoProrrateado =
    compra && orden.cantidadEnviadaKg
      ? (Number(compra.precioKg) * Number(orden.cantidadEnviadaKg))
      : 0;
  const costosTostion =
    Number(orden.costoTostion) + Number(orden.costoMolienda || 0) + Number(orden.costoTransporte || 0);
  const costoRealKg = (costoPergaminoProrrateado + costosTostion) / data.cantidadRecibidaKg;

  const recepcion = await prisma.$transaction(async (tx) => {
    const r = await tx.recepcionTostado.create({
      data: {
        ordenTostionId: data.ordenTostionId,
        fechaRecepcion: new Date(data.fechaRecepcion),
        cantidadRecibidaKg: data.cantidadRecibidaKg,
        bolsasTotales: data.bolsasTotales,
        mermaPct: data.mermaPct,
        costoRealKg,
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : undefined,
        observaciones: data.observaciones,
      },
    });
    await tx.ordenTostion.update({ where: { id: data.ordenTostionId }, data: { estado: 'ENTREGADO' } });
    return r;
  });

  return NextResponse.json(recepcion, { status: 201 });
}
