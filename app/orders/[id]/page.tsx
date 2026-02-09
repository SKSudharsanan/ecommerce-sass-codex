'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, Td, Th } from '@/components/ui/table';

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  totalCents: number;
  items: Array<{ id: string; quantity: number; unitPriceCents: number; totalPriceCents: number; product: { name: string; sku: string } }>;
};

export default function CustomerOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => setOrder(data));
  }, [params.id]);

  if (!order) return <main className="container"><h1>Order details</h1><p>Loading...</p></main>;

  return (
    <main className="container">
      <h1>Order {order.orderNumber}</h1>
      <p>Status: <Badge>{order.status}</Badge></p>
      <p>Total: ${(order.totalCents / 100).toFixed(2)}</p>
      <Table>
        <thead><tr><Th>Product</Th><Th>SKU</Th><Th>Qty</Th><Th>Unit</Th><Th>Total</Th></tr></thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <Td>{item.product.name}</Td>
              <Td>{item.product.sku}</Td>
              <Td>{item.quantity}</Td>
              <Td>${(item.unitPriceCents / 100).toFixed(2)}</Td>
              <Td>${(item.totalPriceCents / 100).toFixed(2)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </main>
  );
}
