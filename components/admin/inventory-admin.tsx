'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, Td, Th } from '@/components/ui/table';

type Inventory = {
  id: string;
  onHand: number;
  reserved: number;
  reorderLevel: number;
  lowStockThreshold: number;
  product: { name: string; sku: string };
};

type StockMovement = {
  id: string;
  createdAt: string;
  type: string;
  reasonCode: string;
  quantityDelta: number;
  note: string | null;
  onHandAfter: number;
  reservedAfter: number;
  inventoryItem: { product: { name: string; sku: string } };
};

const reasonCodes = ['PURCHASE_RECEIPT', 'MANUAL_CORRECTION', 'DAMAGE', 'RETURN_TO_STOCK', 'ORDER_PLACED', 'ORDER_CANCELED'];

export function InventoryAdmin() {
  const [items, setItems] = useState<Inventory[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [movementPage, setMovementPage] = useState(1);
  const [movementTotalPages, setMovementTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Inventory | null>(null);
  const [form, setForm] = useState<any>({ operation: 'adjust', quantity: 0, reasonCode: 'MANUAL_CORRECTION', note: '' });
  const [metaForm, setMetaForm] = useState<any>({ reorderLevel: 0, lowStockThreshold: 0 });

  const load = async () => {
    const data = await fetch(`/api/admin/inventory?page=${page}&filter=${filter}`).then((r) => r.json());
    setItems(data.items);
    setTotalPages(Math.max(1, Math.ceil(data.total / data.pageSize)));
  };

  const loadMovements = async () => {
    const data = await fetch(`/api/admin/inventory/movements?page=${movementPage}`).then((r) => r.json());
    setMovements(data.items);
    setMovementTotalPages(Math.max(1, Math.ceil(data.total / data.pageSize)));
  };

  useEffect(() => {
    void load();
  }, [page, filter]);

  useEffect(() => {
    void loadMovements();
  }, [movementPage]);

  const save = async () => {
    if (!editing) return;

    await fetch('/api/admin/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventoryItemId: editing.id, ...form })
    });

    await fetch(`/api/admin/inventory/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metaForm)
    });

    setOpen(false);
    await Promise.all([load(), loadMovements()]);
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/inventory/${id}`, { method: 'DELETE' });
    await load();
  };

  const tone = (item: Inventory) => (item.onHand <= 0 ? 'danger' : item.onHand <= item.lowStockThreshold ? 'warning' : 'success');
  const label = (item: Inventory) => (item.onHand <= 0 ? 'Out of stock' : item.onHand <= item.lowStockThreshold ? 'Low stock' : 'In stock');

  return (
    <div>
      <h1>Inventory</h1>
      <div className="toolbar">
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </Select>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Product</Th><Th>SKU</Th><Th>On Hand</Th><Th>Reserved</Th><Th>Low-Stock</Th><Th>Status</Th><Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <Td>{item.product.name}</Td>
              <Td>{item.product.sku}</Td>
              <Td>{item.onHand}</Td>
              <Td>{item.reserved}</Td>
              <Td>{item.lowStockThreshold}</Td>
              <Td><Badge tone={tone(item) as any}>{label(item)}</Badge></Td>
              <Td>
                <div className="row-actions">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditing(item);
                      setForm({ operation: 'adjust', quantity: 0, reasonCode: 'MANUAL_CORRECTION', note: '' });
                      setMetaForm({ reorderLevel: item.reorderLevel, lowStockThreshold: item.lowStockThreshold });
                      setOpen(true);
                    }}
                  >
                    Adjust
                  </Button>
                  <Button variant="danger" onClick={() => void remove(item.id)}>Delete</Button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="pagination"><Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button><span>Page {page}/{totalPages}</span><Button variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button></div>

      <h2>Stock Movement Audit Trail</h2>
      <Table>
        <thead><tr><Th>Time</Th><Th>Product</Th><Th>Type</Th><Th>Reason</Th><Th>Delta</Th><Th>On Hand</Th><Th>Reserved</Th><Th>Note</Th></tr></thead>
        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id}>
              <Td>{new Date(movement.createdAt).toLocaleString()}</Td>
              <Td>{movement.inventoryItem.product.name}</Td>
              <Td>{movement.type}</Td>
              <Td>{movement.reasonCode}</Td>
              <Td>{movement.quantityDelta}</Td>
              <Td>{movement.onHandAfter}</Td>
              <Td>{movement.reservedAfter}</Td>
              <Td>{movement.note ?? '-'}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="pagination"><Button variant="secondary" onClick={() => setMovementPage((p) => Math.max(1, p - 1))}>Prev</Button><span>Page {movementPage}/{movementTotalPages}</span><Button variant="secondary" onClick={() => setMovementPage((p) => Math.min(movementTotalPages, p + 1))}>Next</Button></div>

      <Dialog title="Manual Inventory Adjustment" open={open} onClose={() => setOpen(false)}>
        <div className="form-grid">
          <Select value={form.operation} onChange={(e) => setForm((v: any) => ({ ...v, operation: e.target.value }))}>
            <option value="adjust">Adjust</option>
            <option value="receive">Receive</option>
            <option value="reserve">Reserve</option>
            <option value="release">Release</option>
          </Select>
          <Input type="number" value={form.quantity} onChange={(e) => setForm((v: any) => ({ ...v, quantity: Number(e.target.value) }))} placeholder="Quantity" />
          <Select value={form.reasonCode} onChange={(e) => setForm((v: any) => ({ ...v, reasonCode: e.target.value }))}>
            {reasonCodes.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
          </Select>
          <Input value={form.note} onChange={(e) => setForm((v: any) => ({ ...v, note: e.target.value }))} placeholder="Adjustment note" />
          <Input type="number" value={metaForm.reorderLevel} onChange={(e) => setMetaForm((v: any) => ({ ...v, reorderLevel: Number(e.target.value) }))} placeholder="Reorder level" />
          <Input type="number" value={metaForm.lowStockThreshold} onChange={(e) => setMetaForm((v: any) => ({ ...v, lowStockThreshold: Number(e.target.value) }))} placeholder="Low-stock threshold" />
          <Button onClick={() => void save()}>Save</Button>
        </div>
      </Dialog>
    </div>
  );
}
