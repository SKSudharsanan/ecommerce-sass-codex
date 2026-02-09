import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const updated = await prisma.inventoryItem.update({
    where: { id: params.id },
    data: {
      onHand: Number(body.onHand ?? 0),
      reserved: Number(body.reserved ?? 0),
      reorderLevel: Number(body.reorderLevel ?? 0)
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await prisma.inventoryItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
