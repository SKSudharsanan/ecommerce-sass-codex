'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, Td, Th } from '@/components/ui/table';

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPriceCents: number;
  isActive: boolean;
};

const emptyForm = { name: '', sku: '', template: 'default', category: '', brand: '', description: '', unitPriceCents: 0, isActive: true, onHand: 0, reorderLevel: 0, lowStockThreshold: 0 };

export function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    const data = await fetch(`/api/admin/products?page=${page}&search=${encodeURIComponent(search)}&status=${status}`).then((r) => r.json());
    setItems(data.items);
    setTotalPages(Math.max(1, Math.ceil(data.total / data.pageSize)));
  };

  useEffect(() => {
    void load();
  }, [page, search, status]);

  const save = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div>
      <h1>Products</h1>
      <div className="toolbar">
        <Input placeholder="Search name or SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Button onClick={() => setOpen(true)}>New Product</Button>
      </div>

      <Table>
        <thead><tr><Th>Name</Th><Th>SKU</Th><Th>Category</Th><Th>Price</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <Td>{item.name}</Td><Td>{item.sku}</Td><Td>{item.category}</Td><Td>${(item.unitPriceCents / 100).toFixed(2)}</Td>
              <Td><Badge tone={item.isActive ? 'success' : 'warning'}>{item.isActive ? 'Active' : 'Inactive'}</Badge></Td>
              <Td><div className="row-actions"><Button variant="secondary" onClick={() => { setEditing(item); setForm({ ...item }); setOpen(true); }}>Edit</Button><Button variant="danger" onClick={() => void remove(item.id)}>Delete</Button></div></Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="pagination"><Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button><span>Page {page} / {totalPages}</span><Button variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button></div>

      <Dialog title={editing ? 'Edit Product' : 'Create Product'} open={open} onClose={() => setOpen(false)}>
        <div className="form-grid">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm((v: any) => ({ ...v, name: e.target.value }))} />
          <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm((v: any) => ({ ...v, sku: e.target.value }))} />
          <Input placeholder="Template" value={form.template} onChange={(e) => setForm((v: any) => ({ ...v, template: e.target.value }))} />
          <Input placeholder="Category" value={form.category} onChange={(e) => setForm((v: any) => ({ ...v, category: e.target.value }))} />
          <Input placeholder="Unit price (cents)" type="number" value={form.unitPriceCents} onChange={(e) => setForm((v: any) => ({ ...v, unitPriceCents: Number(e.target.value) }))} />
          <Input placeholder="Initial stock" type="number" value={form.onHand} onChange={(e) => setForm((v: any) => ({ ...v, onHand: Number(e.target.value) }))} />
          <Input placeholder="Reorder level" type="number" value={form.reorderLevel} onChange={(e) => setForm((v: any) => ({ ...v, reorderLevel: Number(e.target.value) }))} />
          <Input placeholder="Low-stock threshold" type="number" value={form.lowStockThreshold} onChange={(e) => setForm((v: any) => ({ ...v, lowStockThreshold: Number(e.target.value) }))} />
          <label><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((v: any) => ({ ...v, isActive: e.target.checked }))} /> Active</label>
          <Button onClick={() => void save()}>Save</Button>
        </div>
      </Dialog>
    </div>
  );
}
