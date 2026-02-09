import Link from 'next/link';

const sections = [
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/settings', label: 'Settings' }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <h2>Admin Area</h2>
        <nav>
          {sections.map((section) => (
            <Link key={section.href} href={section.href} className="admin-nav-link">
              {section.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="admin-content">{children}</section>
    </main>
  );
}
