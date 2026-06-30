import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aplicarDescuentoInventario } from '@/lib/fifo';
import { z } from 'zod';

const itemSchema = z.object({
  presentacion: z.enum(['G125', 'G250', 'G500']),
  tipo: z.enum(['MOLIDO', 'GRANO']),
  cantidad: z.coerce.number().int().positive(),
  precioUnitario: z.coerce.number().positive(),
});

const ventaSchema = z.object({
  clienteId: z.string().uuid(),
  fecha: z.string(),
  canal: z.enum(['TIENDA', 'WHATSAPP', 'INSTAGRAM', 'PAGINA_WEB', 'DISTRIBUIDOR', 'EVENTO']),
  metodoPago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO']),
  descuentoTotal: z.coerce.number().optional(),
  observaciones: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

export async function GET() {
  const ventas = await prisma.venta.findMany({
    include: { cliente: true, items: { include: { loteProducto: true } } },
    orderBy: { fecha: 'desc' },
  });
  return NextResponse.json(ventas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ventaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const venta = await prisma.venta.create({
      data: {
        clienteId: data.clienteId,
        fecha: new Date(data.fecha),
        canal: data.canal,
        metodoPago: data.metodoPago,
        descuentoTotal: data.descuentoTotal || 0,
        observaciones: data.observaciones,
      },
    });

    for (const item of data.items) {
      await aplicarDescuentoInventario(venta.id, item.presentacion, item.tipo, item.cantidad, item.precioUnitario);
    }

    const ventaCompleta = await prisma.venta.findUnique({
      where: { id: venta.id },
      include: { items: true },
    });

    return NextResponse.json(ventaCompleta, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
