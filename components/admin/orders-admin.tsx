'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Table, Td, Th } from '@/components/ui/table';

type Order = { id: string; orderNumber: string; status: string; totalCents: number; user: { email: string } };

const orderStatuses = ['PENDING', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELED', 'REFUNDED'];

export function OrdersAdmin() {
  const [items, setItems] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    const data = await fetch(`/api/admin/orders?page=${page}&status=${status}`).then((r) => r.json());
    setItems(data.items);
    setTotalPages(Math.max(1, Math.ceil(data.total / data.pageSize)));
  };

  useEffect(() => { void load(); }, [page, status]);

  const tone = (statusValue: string) => (['DELIVERED', 'PAID'].includes(statusValue) ? 'success' : ['CANCELED', 'REFUNDED'].includes(statusValue) ? 'danger' : 'warning');

  return (
    <div>
      <h1>Orders</h1>
      <div className="toolbar"><Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option>{orderStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</Select></div>
      <Table>
        <thead><tr><Th>Order #</Th><Th>Customer</Th><Th>Total</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}><Td>{item.orderNumber}</Td><Td>{item.user.email}</Td><Td>${(item.totalCents / 100).toFixed(2)}</Td><Td><Badge tone={tone(item.status) as any}>{item.status}</Badge></Td><Td><div className="row-actions"><Link href={`/admin/orders/${item.id}`}><Button variant="secondary">View details</Button></Link></div></Td></tr>)}</tbody>
      </Table>
      <div className="pagination"><Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button><span>Page {page}/{totalPages}</span><Button variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button></div>
    </div>
  );
}
