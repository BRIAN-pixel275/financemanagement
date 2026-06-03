import { createContext, useContext, useState } from 'react';
import { supabase } from '../supabase';
import { getSettings } from '../data/store';

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
      // Fetch passwords from Supabase
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      const map = {};
      data.forEach(row => { map[row.key] = row.value; });

      const correctPass = username === 'admin'
        ? (map.adminPass  || 'admin123')
        : (map.viewerPass || 'viewer123');

      if (password === correctPass) {
        const role = username === 'admin' ? 'admin' : 'viewer';
        const session = { username, role, loginAt: new Date().toISOString() };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return { ok: true };
      }

      return { ok: false, error: 'Invalid username or password' };
    } catch (err) {
      // Fallback to localStorage if Supabase fails
      const settings = getSettings();
      const correctPass = username === 'admin'
        ? (settings.adminPass  || 'admin123')
        : (settings.viewerPass || 'viewer123');

      if (password === correctPass) {
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