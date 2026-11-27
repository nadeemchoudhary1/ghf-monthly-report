import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  adminLoginRequest,
  adminLogoutRequest,
  adminMeRequest,
} from '../services/adminApi.js';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  const verifySession = useCallback(async () => {
    setChecking(true);
    try {
      const res = await adminMeRequest();
      setAdmin(res?.admin || null);
    } catch {
      setAdmin(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = useCallback(async ({ identifier, password }) => {
    const res = await adminLoginRequest({ identifier, password });
    setJustLoggedOut(false);
    setAdmin(res?.admin || null);
    return res;
  }, []);

  const logout = useCallback(async () => {
    setJustLoggedOut(true);
    try {
      await adminLogoutRequest();
    } finally {
      setAdmin(null);
    }
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        checking,
        justLoggedOut,
        isAuthenticated: Boolean(admin),
        login,
        logout,
        verifySession,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }
  return ctx;
}
