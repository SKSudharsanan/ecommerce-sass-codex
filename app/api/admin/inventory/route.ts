import { NextRequest, NextResponse } from 'next/server';
import { StockReasonCode } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { adjustStock, receiveStock, releaseStock, reserveStock } from '@/lib/inventory/service';

const PAGE_SIZE = 8;

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const filter = request.nextUrl.searchParams.get('filter') ?? 'all';

  if (filter === 'low') {
    const [items, total] = await Promise.all([
      prisma.$queryRaw`
        SELECT i.*, row_to_json(p) AS product
        FROM "InventoryItem" i
        JOIN "Product" p ON p.id = i."productId"
        WHERE i."onHand" <= i."lowStockThreshold"
        ORDER BY i."updatedAt" DESC
        OFFSET ${(page - 1) * PAGE_SIZE}
        LIMIT ${PAGE_SIZE}
      `,
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint as count
        FROM "InventoryItem" i
        WHERE i."onHand" <= i."lowStockThreshold"
      `
    ]);

    return NextResponse.json({ items, total: Number(total[0]?.count ?? 0), page, pageSize: PAGE_SIZE });
  }

  const where = filter === 'out' ? { onHand: { lte: 0 } } : {};
  const [items, total] = await Promise.all([
    prisma.inventoryItem.findMany({ where, include: { product: true }, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.inventoryItem.count({ where })
  ]);

  return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE });
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const created = await prisma.inventoryItem.create({
    data: {
      productId: String(body.productId),
      onHand: Number(body.onHand ?? 0),
      reserved: Number(body.reserved ?? 0),
      reorderLevel: Number(body.reorderLevel ?? 0),
      lowStockThreshold: Number(body.lowStockThreshold ?? body.reorderLevel ?? 0)
    }
  });

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const inventoryItemId = String(body.inventoryItemId ?? '');
  const operation = String(body.operation ?? 'adjust');
  const quantity = Number(body.quantity ?? 0);
  const reasonCode = body.reasonCode as StockReasonCode;
  const note = body.note ? String(body.note) : undefined;

  if (!inventoryItemId || !Object.values(StockReasonCode).includes(reasonCode)) {
    return NextResponse.json({ message: 'Invalid request payload' }, { status: 400 });
  }

  try {
    if (operation === 'receive') return NextResponse.json(await receiveStock({ inventoryItemId, quantity, reasonCode, note }));
    if (operation === 'reserve') return NextResponse.json(await reserveStock({ inventoryItemId, quantity, reasonCode, note }));
    if (operation === 'release') return NextResponse.json(await releaseStock({ inventoryItemId, quantity, reasonCode, note }));
    return NextResponse.json(await adjustStock({ inventoryItemId, quantity, reasonCode, note }));
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Inventory update failed' }, { status: 400 });
  }
}
