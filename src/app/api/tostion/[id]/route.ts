import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const estadoSchema = z.object({
  estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'ENTREGADO', 'CANCELADO']),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = estadoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const orden = await prisma.ordenTostion.update({
    where: { id: params.id },
    data: { estado: parsed.data.estado },
  });
  return NextResponse.json(orden);
}
