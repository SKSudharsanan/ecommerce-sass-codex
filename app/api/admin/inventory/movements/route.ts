import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const [items, total] = await Promise.all([
    prisma.stockMovement.findMany({
      include: { inventoryItem: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.stockMovement.count()
  ]);

  return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE });
}
