-- Remove deprecated CONFIRMED status and normalize order status enum.
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELED', 'REFUNDED');

ALTER TABLE "Order"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "OrderStatus_new"
  USING (
    CASE
      WHEN "status"::text = 'CONFIRMED' THEN 'PENDING'::"OrderStatus_new"
      ELSE "status"::text::"OrderStatus_new"
    END
  );

DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
