import { createAuthClient } from '@neondatabase/auth';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

export const isAuthConfigured = Boolean(authUrl);
export const authClient = isAuthConfigured ? createAuthClient(authUrl) : null;

export function normalizeSessionResult(result) {
  const data = result?.data || null;
  if (!data?.session) return null;
  return {
    ...data.session,
    user: data.user || data.session.user || null,
  };
}

export async function getFreshSession() {
  if (!authClient) return null;
  const result = await authClient.getSession();
  if (result.error) throw new Error(result.error.message || 'ログイン情報を確認できませんでした');
  return normalizeSessionResult(result);
}

export async function getAccessToken() {
  const session = await getFreshSession();
  return session?.access_token || null;
}
