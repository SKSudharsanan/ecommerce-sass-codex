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
  const [cart, setCart] = useState<Record<string, number>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/storefront/products')
      .then((r) => r.json())
      .then((data) => setProducts(data.products));
  }, []);

  useEffect(() => {
    const savedCart = window.localStorage.getItem('storefront-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('storefront-cart', JSON.stringify(cart));
  }, [cart]);

  const selectedItems = useMemo(
    () =>
      products
        .map((product) => ({ productId: product.id, quantity: cart[product.id] ?? 0 }))
        .filter((item) => item.quantity > 0),
    [products, cart]
  );

  const totalCents = useMemo(
    () =>
      selectedItems.reduce((sum, item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        return sum + (product?.unitPriceCents ?? 0) * item.quantity;
      }, 0),
    [products, selectedItems]
  );

  const checkout = async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: selectedItems })
    });
    const data = await response.json();

    if (response.ok) {
      setCart({});
      setMessage(`Order ${data.orderNumber} created.`);
      return;
    }

    setMessage(data.message || 'Checkout failed');
  };

  return (
    <main className="container">
      <h1>Storefront</h1>
      <p>Build your cart and checkout. Order creation reserves inventory atomically with order persistence.</p>
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
                    value={cart[product.id] ?? 0}
                    onChange={(e) => setCart((prev) => ({ ...prev, [product.id]: Number(e.target.value) }))}
                  />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <div className="toolbar">
        <span>Cart total: ${(totalCents / 100).toFixed(2)}</span>
        <Button variant="secondary" onClick={() => setCart({})}>Clear cart</Button>
        <Button onClick={() => void checkout()} disabled={!selectedItems.length}>Checkout</Button>
        {message ? <span>{message}</span> : null}
      </div>
    </main>
  );
}
