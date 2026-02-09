'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, Td, Th } from '@/components/ui/table';

type Order = { id: string; orderNumber: string; status: string; totalCents: number; createdAt: string };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(data.items ?? []));
  }, []);

  return (
    <main className="container page">
      <h1>Order History</h1>
      <Table>
        <thead><tr><Th>Order #</Th><Th>Date</Th><Th>Status</Th><Th>Total</Th><Th>Details</Th></tr></thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <Td>{order.orderNumber}</Td>
              <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
              <Td><Badge>{order.status}</Badge></Td>
              <Td>${(order.totalCents / 100).toFixed(2)}</Td>
              <Td><Link href={`/orders/${order.id}`}>View</Link></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </main>
  );
}
