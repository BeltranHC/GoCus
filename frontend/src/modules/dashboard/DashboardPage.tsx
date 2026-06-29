// ============================================
// GOCus — Page: Dashboard
// ============================================

import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__content">
        <span className="stat-card__title">{title}</span>
        <span className="stat-card__value">{value}</span>
        {trend && (
          <span className="stat-card__trend">
            <TrendingUp size={14} />
            {trend}
          </span>
        )}
      </div>
      <div className="stat-card__icon">{icon}</div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
        <p className="dashboard__welcome">
          Bienvenido, <strong>{user?.firstName} {user?.lastName}</strong>
        </p>
      </div>

      <div className="dashboard__stats">
        <StatCard
          title="Ventas del Día"
          value="$0.00"
          icon={<ShoppingCart size={28} />}
          trend="Módulo pendiente"
          color="blue"
        />
        <StatCard
          title="Ventas del Mes"
          value="$0.00"
          icon={<DollarSign size={28} />}
          trend="Módulo pendiente"
          color="green"
        />
        <StatCard
          title="Clientes"
          value="0"
          icon={<Users size={28} />}
          color="purple"
        />
        <StatCard
          title="Productos"
          value="0"
          icon={<Package size={28} />}
          color="orange"
        />
      </div>

      <div className="dashboard__alerts">
        <div className="dashboard__alert">
          <AlertTriangle size={20} />
          <div>
            <strong>Sistema en construcción</strong>
            <p>Los módulos del ERP/POS se irán habilitando progresivamente. La base del sistema está lista y funcionando.</p>
          </div>
        </div>
      </div>

      <div className="dashboard__info-grid">
        <div className="dashboard__info-card">
          <h3>🏢 Empresa</h3>
          <p>{user?.company || 'No asignada'}</p>
        </div>
        <div className="dashboard__info-card">
          <h3>🏪 Sucursal</h3>
          <p>{user?.branch || 'Todas'}</p>
        </div>
        <div className="dashboard__info-card">
          <h3>🔐 Rol</h3>
          <p>{user?.role || 'Sin rol'}</p>
        </div>
        <div className="dashboard__info-card">
          <h3>🔑 Permisos</h3>
          <p>{user?.permissions?.length || 0} permisos asignados</p>
        </div>
      </div>
    </div>
  );
}
