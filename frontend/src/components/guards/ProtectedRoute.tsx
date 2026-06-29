// ============================================
// GOCus — Component: Protected Route
// ============================================

import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/auth.api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, user, setUser, logout, hasPermission } = useAuthStore();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated && !user) {
        try {
          const res = await authApi.getProfile();
          setUser(res.data);
        } catch (error) {
          console.error('Failed to restore session', error);
          logout();
        }
      }
      setIsInitializing(false);
    };

    checkAuth();
  }, [isAuthenticated, user, setUser, logout]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="login-bg__orb login-bg__orb--1" style={{ position: 'relative', width: '50px', height: '50px', filter: 'blur(10px)', animationDuration: '2s' }} />
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '1px' }}>Restaurando sesión...</span>
        </div>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
