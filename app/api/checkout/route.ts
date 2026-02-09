import { NextRequest, NextResponse } from 'next/server';
import { StockReasonCode } from '@prisma/client';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reserveStock } from '@/lib/inventory/service';

type CheckoutItem = { productId: string; quantity: number };

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as { items?: Array<{ productId?: string; quantity?: number }> };
  const incomingItems = Array.isArray(body.items) ? body.items : [];
  const items: CheckoutItem[] = incomingItems
    .map((item) => ({ productId: String(item.productId), quantity: Number(item.quantity ?? 0) }))
    .filter((item) => item.productId && Number.isInteger(item.quantity) && item.quantity > 0);

  if (!items.length) return NextResponse.json({ message: 'No items to checkout' }, { status: 400 });

  try {
    const createdOrder = await prisma.$transaction(async (tx: any) => {
      const productIds = [...new Set(items.map((item) => item.productId))];
      const inventoryRows = await tx.inventoryItem.findMany({
        where: { productId: { in: productIds } },
        include: { product: true }
      });

      const inventoryMap = new Map<string, any>(inventoryRows.map((row: any) => [row.productId, row]));
      let subtotalCents = 0;
      const orderItems: Array<{ productId: string; quantity: number; unitPriceCents: number }> = [];

      for (const requested of items) {
        const inventory = inventoryMap.get(requested.productId);
        if (!inventory) {
          throw new Error(`Product ${requested.productId} is unavailable`);
        }

        subtotalCents += inventory.product.unitPriceCents * requested.quantity;
        orderItems.push({
          productId: requested.productId,
          quantity: requested.quantity,
          unitPriceCents: inventory.product.unitPriceCents
        });
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

      for (const item of orderItems) {
        const inventory = inventoryMap.get(item.productId);
        if (!inventory) continue;

        await reserveStock(
          {
            inventoryItemId: inventory.id,
            quantity: item.quantity,
            reasonCode: StockReasonCode.ORDER_PLACED,
            note: `Reserved for order ${order.orderNumber}`,
            orderId: order.id
          },
          tx
        );
      }

      return order;
    });

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Checkout failed' }, { status: 400 });
  }
}
