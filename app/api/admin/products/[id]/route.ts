import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: body.name,
      sku: body.sku,
      template: body.template,
      category: body.category,
      brand: body.brand || null,
      description: body.description || null,
      unitPriceCents: Number(body.unitPriceCents ?? 0),
      isActive: Boolean(body.isActive)
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
