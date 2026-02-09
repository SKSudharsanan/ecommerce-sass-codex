'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, Td, Th } from '@/components/ui/table';

type Order = { id: string; orderNumber: string; status: string; totalCents: number; user: { email: string } };

const orderStatuses = ['PENDING', 'CONFIRMED', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELED', 'REFUNDED'];

export function OrdersAdmin() {
  const [items, setItems] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<any>({ status: 'PENDING', subtotalCents: 0, totalCents: 0 });

  const load = async () => {
    const data = await fetch(`/api/admin/orders?page=${page}&status=${status}`).then((r) => r.json());
    setItems(data.items);
    setTotalPages(Math.max(1, Math.ceil(data.total / data.pageSize)));
  };

  useEffect(() => { void load(); }, [page, status]);

  const save = async () => {
    if (!editing) return;
    await fetch(`/api/admin/orders/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => { await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' }); await load(); };
  const tone = (statusValue: string) => (['DELIVERED', 'PAID'].includes(statusValue) ? 'success' : ['CANCELED', 'REFUNDED'].includes(statusValue) ? 'danger' : 'warning');

  return (
    <div>
      <h1>Orders</h1>
      <div className="toolbar"><Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option>{orderStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</Select></div>
      <Table>
        <thead><tr><Th>Order #</Th><Th>Customer</Th><Th>Total</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}><Td>{item.orderNumber}</Td><Td>{item.user.email}</Td><Td>${(item.totalCents / 100).toFixed(2)}</Td><Td><Badge tone={tone(item.status) as any}>{item.status}</Badge></Td><Td><div className="row-actions"><Button variant="secondary" onClick={() => { setEditing(item); setForm({ status: item.status, subtotalCents: item.totalCents, totalCents: item.totalCents }); setOpen(true); }}>Update</Button><Button variant="danger" onClick={() => void remove(item.id)}>Delete</Button></div></Td></tr>)}</tbody>
      </Table>
      <div className="pagination"><Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button><span>Page {page}/{totalPages}</span><Button variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button></div>
      <Dialog title="Update Order" open={open} onClose={() => setOpen(false)}>
        <div className="form-grid"><Select value={form.status} onChange={(e) => setForm((v: any) => ({ ...v, status: e.target.value }))}>{orderStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</Select><Input type="number" value={form.totalCents} onChange={(e) => setForm((v: any) => ({ ...v, totalCents: Number(e.target.value), subtotalCents: Number(e.target.value) }))} /><Button onClick={() => void save()}>Save</Button></div>
      </Dialog>
    </div>
  );
}
