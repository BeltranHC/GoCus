// ============================================
// GOCus — Component: Header
// ============================================

import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { authApi } from '../../api/auth.api';

export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue logout even if API call fails
    }
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__left">
        <h2 className="header__title">
          {user?.company || 'GOCus'}
          {user?.branch && (
            <span className="header__subtitle"> — {user.branch}</span>
          )}
        </h2>
      </div>

      <div className="header__right">
        <ThemeToggle />

        <div className="header__user">
          <div className="header__avatar">
            <User size={18} />
          </div>
          <div className="header__user-info">
            <span className="header__user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="header__user-role">{user?.role}</span>
          </div>
        </div>

        <button
          id="logout-btn"
          className="header__logout"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
