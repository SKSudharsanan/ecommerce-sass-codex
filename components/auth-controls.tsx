'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function AuthControls({ isSignedIn }: { isSignedIn: boolean }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  if (!isSignedIn) {
    return (
      <div className="auth-actions">
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      </div>
    );
  }

  return (
    <button type="button" onClick={handleSignOut}>
      Logout
    </button>
  );
}
