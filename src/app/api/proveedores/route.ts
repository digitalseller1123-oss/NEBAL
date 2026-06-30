import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const proveedorSchema = z.object({
  nombre: z.string().min(1),
  finca: z.string().optional(),
  municipio: z.string().optional(),
  departamento: z.string().optional(),
  telefono: z.string().optional(),
});

export async function GET() {
  const proveedores = await prisma.proveedor.findMany({ orderBy: { nombre: 'asc' } });
  return NextResponse.json(proveedores);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = proveedorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const proveedor = await prisma.proveedor.create({ data: parsed.data });
  return NextResponse.json(proveedor, { status: 201 });
}
