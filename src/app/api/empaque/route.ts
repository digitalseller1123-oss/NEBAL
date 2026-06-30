import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const presentacionGramos: Record<string, number> = { G125: 125, G250: 250, G500: 500 };

const itemSchema = z.object({
  presentacion: z.enum(['G125', 'G250', 'G500']),
  tipo: z.enum(['MOLIDO', 'GRANO']),
  cantidadUnidades: z.coerce.number().int().positive(),
});

const empaqueSchema = z.object({
  recepcionId: z.string().uuid(),
  fecha: z.string(),
  operario: z.string().optional(),
  bolsas25kgUsadas: z.coerce.number().positive(),
  items: z.array(itemSchema).min(1),
});

export async function GET() {
  const eventos = await prisma.eventoEmpaque.findMany({
    include: { recepcion: { include: { ordenTostion: { include: { compra: true } } } }, lotesProducto: true },
    orderBy: { fecha: 'desc' },
  });
  return NextResponse.json(eventos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = empaqueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const recepcion = await prisma.recepcionTostado.findUnique({ where: { id: data.recepcionId } });
  if (!recepcion) return NextResponse.json({ error: 'Recepción no encontrada' }, { status: 404 });

  const bolsasDisponibles = recepcion.bolsasTotales - recepcion.bolsasAbiertas;
  if (data.bolsas25kgUsadas > bolsasDisponibles) {
    return NextResponse.json(
      { error: `Solo quedan ${bolsasDisponibles} bolsas de 2.5kg disponibles en este lote` },
      { status: 400 }
    );
  }

  const kgUsados = data.bolsas25kgUsadas * 2.5;
  const rendimientoEsperadoG = kgUsados * 1000; // 1kg tostado -> 1kg empacado (ajustable si hay merma de empaque)
  const rendimientoRealG = data.items.reduce(
    (sum, item) => sum + presentacionGramos[item.presentacion] * item.cantidadUnidades,
    0
  );
  const diferenciaPct = ((rendimientoRealG - rendimientoEsperadoG) / rendimientoEsperadoG) * 100;

  const costoBaseKg = Number(recepcion.costoRealKg || 0);

  const evento = await prisma.$transaction(async (tx) => {
    const ev = await tx.eventoEmpaque.create({
      data: {
        recepcionId: data.recepcionId,
        fecha: new Date(data.fecha),
        operario: data.operario,
        bolsas25kgUsadas: data.bolsas25kgUsadas,
        rendimientoEsperadoG,
        rendimientoRealG,
        diferenciaPct,
      },
    });

    await tx.recepcionTostado.update({
      where: { id: data.recepcionId },
      data: { bolsasAbiertas: { increment: data.bolsas25kgUsadas } },
    });

    for (const item of data.items) {
      const gramosUnidad = presentacionGramos[item.presentacion];
      const costoUnitario = costoBaseKg * (gramosUnidad / 1000);

      await tx.loteProductoTerminado.create({
        data: {
          eventoEmpaqueId: ev.id,
          presentacion: item.presentacion,
          tipo: item.tipo,
          cantidadUnidades: item.cantidadUnidades,
          cantidadDisponible: item.cantidadUnidades,
          costoUnitario,
          fechaEmpaque: new Date(data.fecha),
          fechaVencimiento: recepcion.fechaVencimiento,
        },
      });
    }

    return ev;
  });

  return NextResponse.json(
    { evento, diferenciaPct, alerta: Math.abs(diferenciaPct) > 5 ? 'Rendimiento fuera de rango esperado (±5%)' : null },
    { status: 201 }
  );
}
