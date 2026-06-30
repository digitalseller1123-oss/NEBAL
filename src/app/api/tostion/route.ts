import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ordenSchema = z.object({
  compraId: z.string().uuid(),
  fechaEnvio: z.string(),
  empresaTostadora: z.string().min(1),
  cantidadEnviadaKg: z.coerce.number().positive(),
  numeroOrden: z.string().optional(),
  costoTostion: z.coerce.number().nonnegative(),
  costoMolienda: z.coerce.number().optional(),
  costoTransporte: z.coerce.number().optional(),
  fechaEstimada: z.string().optional(),
});

export async function GET() {
  const ordenes = await prisma.ordenTostion.findMany({
    include: { compra: { include: { proveedor: true } }, recepcion: true },
    orderBy: { fechaEnvio: 'desc' },
  });
  return NextResponse.json(ordenes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ordenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const orden = await prisma.ordenTostion.create({
    data: {
      compraId: data.compraId,
      fechaEnvio: new Date(data.fechaEnvio),
      empresaTostadora: data.empresaTostadora,
      cantidadEnviadaKg: data.cantidadEnviadaKg,
      numeroOrden: data.numeroOrden,
      costoTostion: data.costoTostion,
      costoMolienda: data.costoMolienda,
      costoTransporte: data.costoTransporte,
      fechaEstimada: data.fechaEstimada ? new Date(data.fechaEstimada) : undefined,
      estado: 'PENDIENTE',
    },
  });
  return NextResponse.json(orden, { status: 201 });
}
