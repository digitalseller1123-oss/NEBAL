import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const compraSchema = z.object({
  proveedorId: z.string().uuid(),
  tipoInsumo: z.string().min(1).default('cafe_pergamino'),
  fecha: z.string(),
  cantidadKg: z.coerce.number().positive(),
  precioKg: z.coerce.number().positive(),
  variedad: z.string().optional(),
  proceso: z.string().optional(),
  altura: z.string().optional(),
  humedad: z.coerce.number().optional(),
  codigoLoteInterno: z.string().min(1),
  observaciones: z.string().optional(),
});

export async function GET() {
  const compras = await prisma.compraPergamino.findMany({
    include: { proveedor: true },
    orderBy: { fecha: 'desc' },
  });
  return NextResponse.json(compras);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = compraSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const costoTotal = data.cantidadKg * data.precioKg;

  try {
    const compra = await prisma.compraPergamino.create({
      data: {
        proveedorId: data.proveedorId,
        tipoInsumo: data.tipoInsumo,
        fecha: new Date(data.fecha),
        cantidadKg: data.cantidadKg,
        precioKg: data.precioKg,
        costoTotal,
        variedad: data.variedad,
        proceso: data.proceso,
        altura: data.altura,
        humedad: data.humedad,
        codigoLoteInterno: data.codigoLoteInterno,
        observaciones: data.observaciones,
      },
    });
    return NextResponse.json(compra, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
