import {
  Prisma,
  PrismaClient,
  StockMovementType,
  StockReasonCode
} from '@prisma/client';
import { prisma } from '@/lib/prisma';

type DbClient = PrismaClient | Prisma.TransactionClient;

async function runInTransaction<T>(db: DbClient, work: (tx: Prisma.TransactionClient) => Promise<T>) {
  if (db instanceof PrismaClient) return db.$transaction(work);
  return work(db);
}

type MovementParams = {
  inventoryItemId: string;
  quantity: number;
  reasonCode: StockReasonCode;
  note?: string;
  orderId?: string;
};

async function withInventoryLock(db: DbClient, inventoryItemId: string) {
  await db.$queryRaw`SELECT id FROM "InventoryItem" WHERE id = ${inventoryItemId} FOR UPDATE`;
  return db.inventoryItem.findUnique({ where: { id: inventoryItemId } });
}

function assertPositiveQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Quantity must be a positive integer');
  }
}

async function recordMovement(db: DbClient, args: {
  inventoryItemId: string;
  type: StockMovementType;
  reasonCode: StockReasonCode;
  quantityDelta: number;
  note?: string;
  orderId?: string;
  onHandAfter: number;
  reservedAfter: number;
}) {
  await db.stockMovement.create({
    data: {
      inventoryItemId: args.inventoryItemId,
      orderId: args.orderId,
      type: args.type,
      reasonCode: args.reasonCode,
      quantityDelta: args.quantityDelta,
      note: args.note,
      onHandAfter: args.onHandAfter,
      reservedAfter: args.reservedAfter
    }
  });
}

export async function receiveStock({ inventoryItemId, quantity, reasonCode, note }: MovementParams, db: DbClient = prisma) {
  assertPositiveQuantity(quantity);

  return runInTransaction(db, async (tx) => {
    const item = await withInventoryLock(tx, inventoryItemId);
    if (!item) throw new Error('Inventory item not found');

    const updated = await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { onHand: item.onHand + quantity }
    });

    await recordMovement(tx, {
      inventoryItemId,
      type: StockMovementType.RECEIVE,
      reasonCode,
      quantityDelta: quantity,
      note,
      onHandAfter: updated.onHand,
      reservedAfter: updated.reserved
    });

    return updated;
  });
}

export async function adjustStock({ inventoryItemId, quantity, reasonCode, note }: MovementParams, db: DbClient = prisma) {
  if (!Number.isInteger(quantity) || quantity === 0) {
    throw new Error('Adjustment quantity must be a non-zero integer');
  }

  return runInTransaction(db, async (tx) => {
    const item = await withInventoryLock(tx, inventoryItemId);
    if (!item) throw new Error('Inventory item not found');

    const nextOnHand = item.onHand + quantity;
    if (nextOnHand < item.reserved) {
      throw new Error('Cannot adjust below reserved stock');
    }

    const updated = await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { onHand: nextOnHand }
    });

    await recordMovement(tx, {
      inventoryItemId,
      type: StockMovementType.ADJUST,
      reasonCode,
      quantityDelta: quantity,
      note,
      onHandAfter: updated.onHand,
      reservedAfter: updated.reserved
    });

    return updated;
  });
}

export async function reserveStock({ inventoryItemId, quantity, reasonCode, note, orderId }: MovementParams, db: DbClient = prisma) {
  assertPositiveQuantity(quantity);

  return runInTransaction(db, async (tx) => {
    const item = await withInventoryLock(tx, inventoryItemId);
    if (!item) throw new Error('Inventory item not found');

    const available = item.onHand - item.reserved;
    if (quantity > available) {
      throw new Error(`Insufficient available stock. Requested ${quantity}, available ${available}`);
    }

    const updated = await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { reserved: item.reserved + quantity }
    });

    await recordMovement(tx, {
      inventoryItemId,
      type: StockMovementType.RESERVE,
      reasonCode,
      quantityDelta: quantity,
      note,
      orderId,
      onHandAfter: updated.onHand,
      reservedAfter: updated.reserved
    });

    return updated;
  });
}

export async function releaseStock({ inventoryItemId, quantity, reasonCode, note, orderId }: MovementParams, db: DbClient = prisma) {
  assertPositiveQuantity(quantity);

  return runInTransaction(db, async (tx) => {
    const item = await withInventoryLock(tx, inventoryItemId);
    if (!item) throw new Error('Inventory item not found');
    if (quantity > item.reserved) {
      throw new Error(`Cannot release ${quantity}; only ${item.reserved} currently reserved`);
    }

    const updated = await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { reserved: item.reserved - quantity }
    });

    await recordMovement(tx, {
      inventoryItemId,
      type: StockMovementType.RELEASE,
      reasonCode,
      quantityDelta: -quantity,
      note,
      orderId,
      onHandAfter: updated.onHand,
      reservedAfter: updated.reserved
    });

    return updated;
  });
}
