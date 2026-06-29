// ============================================
// GOCus — Page: 404 Not Found
// ============================================

import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <div className="not-found__content">
        <h1 className="not-found__code">404</h1>
        <h2 className="not-found__title">Página no encontrada</h2>
        <p className="not-found__message">
          La página que buscas no existe o fue movida.
        </p>
        <button
          className="not-found__button"
          onClick={() => navigate('/dashboard')}
        >
          <Home size={18} />
          <span>Ir al Dashboard</span>
        </button>
      </div>
    </div>
  );
}
