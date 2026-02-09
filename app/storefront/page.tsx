'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, Td, Th } from '@/components/ui/table';

type Product = {
  id: string;
  name: string;
  sku: string;
  unitPriceCents: number;
  inventoryItem: { onHand: number; reserved: number } | null;
};

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/storefront/products')
      .then((r) => r.json())
      .then((data) => setProducts(data.products));
  }, []);

  const selectedItems = useMemo(
    () =>
      products
        .map((product) => ({ productId: product.id, quantity: qty[product.id] ?? 0 }))
        .filter((item) => item.quantity > 0),
    [products, qty]
  );

  const checkout = async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: selectedItems })
    });
    const data = await response.json();
    setMessage(response.ok ? `Order ${data.orderNumber} created.` : data.message || 'Checkout failed');
  };

  return (
    <main className="container">
      <h1>Storefront</h1>
      <p>Select quantities and checkout. Orders are blocked when requested quantity exceeds available stock.</p>
      <Table>
        <thead><tr><Th>Product</Th><Th>SKU</Th><Th>Price</Th><Th>Available</Th><Th>Qty</Th></tr></thead>
        <tbody>
          {products.map((product) => {
            const available = Math.max(0, (product.inventoryItem?.onHand ?? 0) - (product.inventoryItem?.reserved ?? 0));
            return (
              <tr key={product.id}>
                <Td>{product.name}</Td>
                <Td>{product.sku}</Td>
                <Td>${(product.unitPriceCents / 100).toFixed(2)}</Td>
                <Td>{available}</Td>
                <Td>
                  <Input
                    type="number"
                    min={0}
                    max={available}
                    value={qty[product.id] ?? 0}
                    onChange={(e) => setQty((prev) => ({ ...prev, [product.id]: Number(e.target.value) }))}
                  />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <div className="toolbar">
        <Button onClick={() => void checkout()} disabled={!selectedItems.length}>Checkout</Button>
        {message ? <span>{message}</span> : null}
      </div>
    </main>
  );
}
