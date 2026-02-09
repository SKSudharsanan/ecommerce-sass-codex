import Link from 'next/link';
import type { TemplateKey } from '@/lib/template-config';
import { templateThemes } from '@/lib/template-config';

export function TemplateNavbar({ template }: { template: TemplateKey }) {
  const theme = templateThemes[template];

  return (
    <div className="glass-card template-nav">
      <div className="brand-mark" style={{ backgroundColor: theme.accent }} />
      <strong>{theme.label} Store</strong>
      <nav>
        <Link href={`/?template=${template}`}>Home</Link>
        <Link href="/storefront">Shop</Link>
        <Link href="/orders">Orders</Link>
      </nav>
    </div>
  );
}
