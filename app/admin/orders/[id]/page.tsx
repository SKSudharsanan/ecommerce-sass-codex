'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, Td, Th } from '@/components/ui/table';

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  totalCents: number;
  user: { email: string };
  items: Array<{ id: string; quantity: number; unitPriceCents: number; totalPriceCents: number; product: { name: string; sku: string } }>;
};

const transitions: Record<string, string[]> = {
  PENDING: ['PAID', 'CANCELED'],
  PAID: ['PACKED', 'REFUNDED', 'CANCELED'],
  PACKED: ['SHIPPED', 'CANCELED'],
  SHIPPED: ['DELIVERED', 'REFUNDED'],
  DELIVERED: ['REFUNDED'],
  CANCELED: [],
  REFUNDED: []
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    const response = await fetch(`/api/admin/orders/${params.id}`);
    if (!response.ok) return;
    setOrder(await response.json());
  };

  useEffect(() => { void load(); }, [params.id]);

  const updateStatus = async (status: string) => {
    const response = await fetch(`/api/admin/orders/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    setMessage(response.ok ? `Order moved to ${status}` : data.message || 'Status update failed');
    if (response.ok) await load();
  };

  if (!order) return <main className="container"><h1>Order details</h1><p>Loading...</p></main>;

  return (
    <main className="container">
      <h1>Order {order.orderNumber}</h1>
      <p>Customer: {order.user.email}</p>
      <p>Status: <Badge>{order.status}</Badge></p>
      <p>Total: ${(order.totalCents / 100).toFixed(2)}</p>
      <div className="toolbar">
        {transitions[order.status]?.map((nextStatus) => (
          <Button key={nextStatus} onClick={() => void updateStatus(nextStatus)}>{nextStatus}</Button>
        ))}
      </div>
      {message ? <p>{message}</p> : null}
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
