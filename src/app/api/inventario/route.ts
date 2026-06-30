import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const lotes = await prisma.loteProductoTerminado.findMany({
    include: {
      eventoEmpaque: {
        include: {
          recepcion: { include: { ordenTostion: { include: { compra: { include: { proveedor: true } } } } } },
        },
      },
    },
    orderBy: { fechaEmpaque: 'asc' },
  });
  return NextResponse.json(lotes);
}
