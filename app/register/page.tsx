'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '');
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    const result = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: '/storefront'
    });

    if (result.error) {
      setError(result.error.message || 'Unable to register.');
      return;
    }

    router.push('/storefront');
    router.refresh();
  };

  return (
    <main className="container page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
        <input name="name" type="text" required placeholder="Full name" />
        <input name="email" type="email" required placeholder="Email" />
        <input name="password" type="password" required placeholder="Password" minLength={8} />
        <button type="submit">Create account</button>
      </form>
      {error ? <p>{error}</p> : null}
    </main>
  );
}
