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
    try {
      // Call the edge function — password never goes to console
      const { data, error } = await supabase.functions.invoke('verify-password', {
        body: { username, password }
      });

      if (error) throw error;

      if (data?.ok) {
        const role = username === 'admin' ? 'admin' : 'viewer';
        const session = { username, role, loginAt: new Date().toISOString() };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return { ok: true };
      }

      return { ok: false, error: data?.error || 'Invalid username or password' };

    } catch (err) {
      return { ok: false, error: 'Login failed. Please try again.' };
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