import { auth } from '@/lib/auth';

export async function requireAdmin(headers: Headers) {
  const session = await auth.api.getSession({ headers });
  const role = (session?.user?.role as string | undefined)?.toLowerCase();

  if (!session?.user || role !== 'admin') {
    return null;
  }

  return session.user;
}
