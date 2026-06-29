// ============================================
// GOCus — Component: Main Layout
// ============================================

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__content">
        <Header />
        <main className="layout__main">
          <Outlet />
        </main>
        <footer style={{
          textAlign: 'center',
          padding: '1rem',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-base)'
        }}>
          GOCus ERP/POS &copy; {new Date().getFullYear()}. Desarrollado por <a href="https://beltranhc.github.io/portafolio/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-brand-dark)', fontWeight: 'bold', textDecoration: 'none' }}>JuniDev</a>
        </footer>
      </div>
    </div>
  );
}
