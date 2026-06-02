import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Accountability from './pages/Accountability';
import SettingsPage from './pages/SettingsPage';

function AppShell() {
  const { user, isAdmin } = useAuth();

  if (!user) return <LoginPage />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/transactions"    element={<Transactions />} />
          <Route path="/analytics"       element={<Analytics />} />
          <Route path="/reports"         element={<Reports />} />
          <Route path="/accountability"  element={<Accountability />} />
          {/* Settings only for admin */}
          <Route path="/settings" element={isAdmin ? <SettingsPage /> : <Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
