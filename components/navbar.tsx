import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { AuthControls } from '@/components/auth-controls';

export async function Navbar() {
  const session = await auth.api.getSession({
    headers: headers()
  });

  const role = (session?.user?.role as string | undefined) ?? null;

  return (
    <header className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link href="/">Home</Link>
        {role === 'admin' ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/management">Management</Link>
          </>
        ) : null}
        {role === 'customer' ? (
          <>
            <Link href="/storefront">Storefront</Link>
            <Link href="/orders">Order History</Link>
          </>
        ) : null}
      </nav>
      <AuthControls isSignedIn={Boolean(session?.user)} />
    </header>
  );
}
