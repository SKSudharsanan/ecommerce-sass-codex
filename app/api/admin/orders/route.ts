import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { ORDER_STATUSES } from '@/lib/orders';

const PAGE_SIZE = 8;

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const status = request.nextUrl.searchParams.get('status') ?? 'all';

  const where = status === 'all' ? {} : { status: status as never };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: true, items: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.order.count({ where })
  ]);

  return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE, statuses: ORDER_STATUSES });
}
