import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  authClient,
  getFreshSession,
  isAuthConfigured,
  normalizeSessionResult,
} from '../services/authClient';

const AccountContext = createContext(null);
const REFERRAL_STORAGE_KEY = 'study-hint-referral-code';

function rememberReferralCode() {
  const params = new URLSearchParams(window.location.search);
  const code = String(params.get('ref') || '').trim().toUpperCase();
  if (/^[A-Z0-9_-]{4,32}$/.test(code) && !localStorage.getItem(REFERRAL_STORAGE_KEY)) {
    localStorage.setItem(REFERRAL_STORAGE_KEY, code);
  }
}

export function AccountProvider({ children }) {
  const [session, setSession] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(isAuthConfigured);
  const [error, setError] = useState('');

  const apiFetch = useCallback(async (path, options = {}) => {
    const freshSession = await getFreshSession();
    setSession(freshSession);
    if (!freshSession?.access_token) throw new Error('ログインしてください');

    const response = await fetch(path, {
      ...options,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${freshSession.access_token}`,
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '通信に失敗しました');
    return data;
  }, []);

  const syncProfile = useCallback(async (learning = {}) => {
    if (!isAuthConfigured) return null;
    const data = await apiFetch('/api/profile/sync', {
      method: 'POST',
      body: JSON.stringify({
        referralCode: localStorage.getItem(REFERRAL_STORAGE_KEY) || '',
        ...learning,
      }),
    });
    setAccount(data);
    return data;
  }, [apiFetch]);

  const refreshAccount = useCallback(async () => {
    if (!isAuthConfigured) return null;
    setError('');
    try {
      const data = await apiFetch('/api/account');
      setAccount(data);
      return data;
    } catch (requestError) {
      if (requestError.message.includes('まだ作成')) return syncProfile();
      setError(requestError.message);
      throw requestError;
    }
  }, [apiFetch, syncProfile]);

  useEffect(() => {
    rememberReferralCode();
    if (!isAuthConfigured) return;

    let active = true;
    (async () => {
      try {
        const freshSession = await getFreshSession();
        if (!active) return;
        setSession(freshSession);
        if (freshSession) await syncProfile();
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [syncProfile]);

  const signIn = useCallback(async ({ email, password }) => {
    setError('');
    const result = await authClient.signIn.email({ email, password, rememberMe: true });
    if (result.error) throw new Error(result.error.message || 'ログインできませんでした');
    const nextSession = normalizeSessionResult(result) || await getFreshSession();
    setSession(nextSession);
    if (nextSession) await syncProfile();
    return nextSession;
  }, [syncProfile]);

  const signUp = useCallback(async ({ name, email, password }) => {
    setError('');
    const result = await authClient.signUp.email({ name, email, password });
    if (result.error) throw new Error(result.error.message || '登録できませんでした');
    const nextSession = normalizeSessionResult(result) || await getFreshSession();
    setSession(nextSession);
    if (nextSession) await syncProfile();
    return { session: nextSession, needsVerification: !nextSession };
  }, [syncProfile]);

  const verifyEmail = useCallback(async ({ email, otp }) => {
    setError('');
    const result = await authClient.emailOtp.verifyEmail({ email, otp });
    if (result.error) throw new Error(result.error.message || '確認コードを確認できませんでした');
    const nextSession = normalizeSessionResult(result) || await getFreshSession();
    setSession(nextSession);
    if (nextSession) await syncProfile();
    return nextSession;
  }, [syncProfile]);

  const signOut = useCallback(async () => {
    if (authClient) await authClient.signOut();
    setSession(null);
    setAccount(null);
    setError('');
  }, []);

  const value = useMemo(() => ({
    configured: isAuthConfigured,
    session,
    user: session?.user || null,
    account,
    loading,
    error,
    setError,
    isPremium: Boolean(account?.subscription?.isPremium || account?.isAdmin),
    isAdmin: Boolean(account?.isAdmin),
    signIn,
    signUp,
    verifyEmail,
    signOut,
    syncProfile,
    refreshAccount,
    apiFetch,
  }), [
    session, account, loading, error, signIn, signUp, verifyEmail, signOut,
    syncProfile, refreshAccount, apiFetch,
  ]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccount must be used inside AccountProvider');
  return context;
}
