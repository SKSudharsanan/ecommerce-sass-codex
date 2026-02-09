'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, Td, Th } from '@/components/ui/table';

type Inventory = { id: string; onHand: number; reserved: number; reorderLevel: number; product: { name: string } };

export function InventoryAdmin() {
  const [items, setItems] = useState<Inventory[]>([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Inventory | null>(null);
  const [form, setForm] = useState<any>({ onHand: 0, reserved: 0, reorderLevel: 0 });

  const load = async () => {
    const data = await fetch(`/api/admin/inventory?page=${page}&filter=${filter}`).then((r) => r.json());
    setItems(data.items);
    setTotalPages(Math.max(1, Math.ceil(data.total / data.pageSize)));
  };

  useEffect(() => { void load(); }, [page, filter]);

  const save = async () => {
    if (!editing) return;
    await fetch(`/api/admin/inventory/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/inventory/${id}`, { method: 'DELETE' });
    await load();
  };

  const tone = (item: Inventory) => (item.onHand <= 0 ? 'danger' : item.onHand <= item.reorderLevel ? 'warning' : 'success');
  const label = (item: Inventory) => (item.onHand <= 0 ? 'Out of stock' : item.onHand <= item.reorderLevel ? 'Low stock' : 'In stock');

  return (
    <div>
      <h1>Inventory</h1>
      <div className="toolbar"><Select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All</option><option value="low">Low stock</option><option value="out">Out of stock</option></Select></div>
      <Table>
        <thead><tr><Th>Product</Th><Th>On Hand</Th><Th>Reserved</Th><Th>Reorder</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}><Td>{item.product.name}</Td><Td>{item.onHand}</Td><Td>{item.reserved}</Td><Td>{item.reorderLevel}</Td><Td><Badge tone={tone(item) as any}>{label(item)}</Badge></Td><Td><div className="row-actions"><Button variant="secondary" onClick={() => { setEditing(item); setForm({ onHand: item.onHand, reserved: item.reserved, reorderLevel: item.reorderLevel }); setOpen(true); }}>Adjust</Button><Button variant="danger" onClick={() => void remove(item.id)}>Delete</Button></div></Td></tr>)}</tbody>
      </Table>
      <div className="pagination"><Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button><span>Page {page}/{totalPages}</span><Button variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button></div>
      <Dialog title="Update Inventory" open={open} onClose={() => setOpen(false)}>
        <div className="form-grid"><Input type="number" value={form.onHand} onChange={(e) => setForm((v: any) => ({ ...v, onHand: Number(e.target.value) }))} /><Input type="number" value={form.reserved} onChange={(e) => setForm((v: any) => ({ ...v, reserved: Number(e.target.value) }))} /><Input type="number" value={form.reorderLevel} onChange={(e) => setForm((v: any) => ({ ...v, reorderLevel: Number(e.target.value) }))} /><Button onClick={() => void save()}>Save</Button></div>
      </Dialog>
    </div>
  );
}
