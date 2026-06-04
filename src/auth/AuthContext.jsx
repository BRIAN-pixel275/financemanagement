import { createContext, useContext, useState } from 'react';
import { supabase } from '../supabase';

const SESSION_KEY = 'cv_session';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = sessionStorage.getItem(SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const login = async (username, password) => {
    // Only allow admin or viewer
    if (!['admin', 'viewer'].includes(username)) {
      return { ok: false, error: 'Invalid username' };
    }

    try {
      // Try the edge function first (hashed passwords)
      const { data, error } = await supabase.functions.invoke('verify-password', {
        body: { username, password }
      });

      if (!error && data?.ok) {
        const role = username === 'admin' ? 'admin' : 'viewer';
        const session = { username, role, loginAt: new Date().toISOString() };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return { ok: true };
      }

      // Fallback — check plain text in settings table
      const key = username === 'admin' ? 'adminPass' : 'viewerPass';
      const { data: row } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

      if (row?.value === password) {
        const role = username === 'admin' ? 'admin' : 'viewer';
        const session = { username, role, loginAt: new Date().toISOString() };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return { ok: true };
      }

      // Final fallback — default hardcoded passwords
      const defaults = { admin: 'admin123', viewer: 'viewer123' };
      if (defaults[username] === password) {
        const role = username === 'admin' ? 'admin' : 'viewer';
        const session = { username, role, loginAt: new Date().toISOString() };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return { ok: true };
      }

      return { ok: false, error: 'Invalid username or password' };

    } catch (err) {
      // If everything fails, use default passwords
      const defaults = { admin: 'admin123', viewer: 'viewer123' };
      if (defaults[username] === password) {
        const role = username === 'admin' ? 'admin' : 'viewer';
        const session = { username, role, loginAt: new Date().toISOString() };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return { ok: true };
      }
      return { ok: false, error: 'Invalid username or password' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const isAdmin  = user?.role === 'admin';
  const isViewer = user?.role === 'viewer';
  const canEdit  = isAdmin;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isViewer, canEdit }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}