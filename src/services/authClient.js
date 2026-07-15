import { createAuthClient } from '@neondatabase/auth';

// 認証URLは2か所から解決する。
// 1. ビルド時の環境変数 VITE_NEON_AUTH_URL（従来どおり）
// 2. Workerの実行時変数 NEON_AUTH_URL（/api/config経由・再ビルド不要）
const buildTimeAuthUrl = import.meta.env.VITE_NEON_AUTH_URL || '';

let authClient = buildTimeAuthUrl ? createAuthClient(buildTimeAuthUrl) : null;

export function getAuthClient() {
  return authClient;
}

export function isAuthReady() {
  return Boolean(authClient);
}

export async function initAuth() {
  if (authClient) return true;
  try {
    const response = await fetch('/api/config');
    if (!response.ok) return false;
    const data = await response.json().catch(() => ({}));
    if (data.neonAuthUrl) {
      authClient = createAuthClient(data.neonAuthUrl);
    }
  } catch (error) {
    console.warn('認証設定を取得できませんでした:', error.message);
  }
  return Boolean(authClient);
}

export function normalizeSessionResult(result) {
  const data = result?.data || null;
  if (!data?.session) return null;
  return {
    ...data.session,
    // Neon Auth (Better Auth) exposes the signed JWT as `session.token`.
    // Keep `access_token` as the app's internal compatibility name.
    access_token: data.session.access_token || data.session.token || null,
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
