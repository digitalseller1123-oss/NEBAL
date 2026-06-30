import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const clienteSchema = z.object({
  nombre: z.string().min(1),
  documento: z.string().optional(),
  empresa: z.string().optional(),
  telefono: z.string().optional(),
  correo: z.string().optional(),
  ciudad: z.string().optional(),
  notas: z.string().optional(),
});

export async function GET() {
  const clientes = await prisma.cliente.findMany({
    include: { ventas: { include: { items: true } } },
    orderBy: { nombre: 'asc' },
  });
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = clienteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const cliente = await prisma.cliente.create({ data: parsed.data });
  return NextResponse.json(cliente, { status: 201 });
}
