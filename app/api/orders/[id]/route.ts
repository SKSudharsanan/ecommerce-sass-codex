import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { items: { include: { product: true } } }
  });

  if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  return NextResponse.json(order);
}
