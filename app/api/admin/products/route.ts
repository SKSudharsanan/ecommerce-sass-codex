import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

const PAGE_SIZE = 8;

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const search = request.nextUrl.searchParams.get('search') ?? '';
  const status = request.nextUrl.searchParams.get('status') ?? 'all';
  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { sku: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}),
    ...(status === 'active' ? { isActive: true } : {}),
    ...(status === 'inactive' ? { isActive: false } : {})
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, include: { inventoryItem: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.product.count({ where })
  ]);

  return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE });
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request.headers);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const name = String(body.name ?? '').trim();
  const sku = String(body.sku ?? '').trim();
  const template = String(body.template ?? '').trim();
  const category = String(body.category ?? '').trim();

  if (!name || !sku || !template || !category) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const created = await prisma.product.create({
    data: {
      name,
      slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      sku,
      template,
      category,
      brand: body.brand ? String(body.brand) : null,
      description: body.description ? String(body.description) : null,
      unitPriceCents: Number(body.unitPriceCents ?? 0),
      isActive: Boolean(body.isActive ?? true),
      inventoryItem: { create: { onHand: Number(body.onHand ?? 0), reorderLevel: Number(body.reorderLevel ?? 0), lowStockThreshold: Number(body.lowStockThreshold ?? body.reorderLevel ?? 0) } }
    }
  });

  return NextResponse.json(created, { status: 201 });
}
