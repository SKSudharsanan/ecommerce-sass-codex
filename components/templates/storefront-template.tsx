import type { TemplateKey } from '@/lib/template-config';
import { TemplateNavbar } from '@/components/blocks/template-navbar';
import { TemplateHero } from '@/components/blocks/template-hero';
import { PromoBanner } from '@/components/blocks/promo-banner';
import { CategoryGrid } from '@/components/blocks/category-grid';
import { ProductCard } from '@/components/blocks/product-card';
import { TemplateFooter } from '@/components/blocks/template-footer';

const productMap: Record<TemplateKey, Array<{ name: string; price: string; meta: string }>> = {
  supermarket: [
    { name: 'Organic Apples', price: '$4.99', meta: '1kg bag · farm fresh' },
    { name: 'Whole Wheat Bread', price: '$2.49', meta: 'Freshly baked each morning' },
    { name: 'Family Milk Pack', price: '$5.99', meta: '2L x2 · fortified' }
  ],
  clothes: [
    { name: 'Oversized Tee', price: '$29.00', meta: 'Heavyweight cotton · unisex' },
    { name: 'Cargo Trousers', price: '$59.00', meta: 'Relaxed fit · all-season' },
    { name: 'Trail Jacket', price: '$119.00', meta: 'Water resistant · breathable' }
  ],
  medicines: [
    { name: 'Vitamin D3', price: '$14.99', meta: '60 capsules · daily support' },
    { name: 'Pain Relief Gel', price: '$8.99', meta: 'Fast-acting topical care' },
    { name: 'First Aid Kit', price: '$34.99', meta: '34-piece emergency essentials' }
  ]
};

export function StorefrontTemplate({ template }: { template: TemplateKey }) {
  return (
    <main className="template-page container">
      <TemplateNavbar template={template} />
      <TemplateHero template={template} />
      <PromoBanner template={template} />
      <CategoryGrid template={template} />
      <section>
        <h2>Featured products</h2>
        <div className="product-grid">
          {productMap[template].map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      </section>
      <TemplateFooter template={template} />
    </main>
  );
}
