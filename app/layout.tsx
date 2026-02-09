import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Ecommerce SaaS Codex',
  description: 'Starter Next.js App Router project with TypeScript.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
