import { NextRequest, NextResponse } from 'next/server';
import { StockReasonCode } from '@prisma/client';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reserveStock } from '@/lib/inventory/service';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!items.length) return NextResponse.json({ message: 'No items to checkout' }, { status: 400 });

  try {
    const createdOrder = await prisma.$transaction(async (tx) => {
      const inventoryRows = await tx.inventoryItem.findMany({
        where: { productId: { in: items.map((item: any) => String(item.productId)) } },
        include: { product: true }
      });

      const inventoryMap = new Map(inventoryRows.map((row) => [row.productId, row]));
      let subtotalCents = 0;
      const orderItems: Array<{ productId: string; quantity: number; unitPriceCents: number }> = [];

      for (const requested of items) {
        const productId = String(requested.productId);
        const quantity = Number(requested.quantity ?? 0);
        const inventory = inventoryMap.get(productId);

        if (!inventory || quantity <= 0) {
          throw new Error(`Invalid checkout item for product ${productId}`);
        }

        await reserveStock(
          {
            inventoryItemId: inventory.id,
            quantity,
            reasonCode: StockReasonCode.ORDER_PLACED,
            note: 'Reserved during checkout'
          },
          tx
        );

        subtotalCents += inventory.product.unitPriceCents * quantity;
        orderItems.push({ productId, quantity, unitPriceCents: inventory.product.unitPriceCents });
      }

      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          orderNumber: `WEB-${Date.now()}`,
          status: 'PENDING',
          subtotalCents,
          totalCents: subtotalCents,
          placedAt: new Date(),
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents,
              totalPriceCents: item.unitPriceCents * item.quantity
            }))
          }
        },
        include: { items: true }
      });

      return order;
    });

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Checkout failed' }, { status: 400 });
  }
}
