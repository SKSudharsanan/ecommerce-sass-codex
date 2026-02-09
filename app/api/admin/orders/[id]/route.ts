import { NextRequest, NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { canTransitionOrderStatus } from '@/lib/orders';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { user: true, items: { include: { product: true } } }
  });

  if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const nextStatus = String(body.status ?? '').toUpperCase() as OrderStatus;

  const existing = await prisma.order.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

  if (!canTransitionOrderStatus(existing.status, nextStatus)) {
    return NextResponse.json(
      { message: `Invalid status transition ${existing.status} -> ${nextStatus}` },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status: nextStatus }
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await prisma.order.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
