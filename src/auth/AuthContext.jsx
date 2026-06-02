// ─── Auth System ─────────────────────────────────────────────────────────────
// Two roles: admin (full access) and viewer (read-only, can print/export)
// Credentials stored in settings. Session stored in sessionStorage.

import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../data/store';

// Default credentials (users can change in Settings)
export const DEFAULT_CREDENTIALS = {
  admin:  { password: 'admin123',  role: 'admin'  },
  viewer: { password: 'viewer123', role: 'viewer' },
};

const SESSION_KEY = 'cv_session';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = sessionStorage.getItem(SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const login = (username, password) => {
    const settings = getSettings();
    // Check credentials — settings override defaults
    const creds = {
      admin:  { password: settings.adminPass  || DEFAULT_CREDENTIALS.admin.password,  role: 'admin'  },
      viewer: { password: settings.viewerPass || DEFAULT_CREDENTIALS.viewer.password, role: 'viewer' },
    };
    const match = creds[username];
    if (match && match.password === password) {
      const session = { username, role: match.role, loginAt: new Date().toISOString() };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid username or password' };
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
