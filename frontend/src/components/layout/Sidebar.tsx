// ============================================
// GOCus — Component: Sidebar
// ============================================

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  GitBranch,
  Package,
  ShoppingCart,
  Store,
  Truck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  Tags,
  Bookmark,
  Ruler,
  UserCheck,
  PackageSearch,
  ScrollText,
  Wallet,
  Bell,
  FileSearch,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  permission?: string;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'General',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    ],
  },
  {
    title: 'Seguridad',
    items: [
      { label: 'Usuarios', path: '/users', icon: <Users size={20} />, permission: 'users:read' },
      { label: 'Roles', path: '/roles', icon: <Shield size={20} />, permission: 'roles:read' },
    ],
  },
  {
    title: 'Organización',
    items: [
      { label: 'Empresas', path: '/companies', icon: <Building2 size={20} />, permission: 'companies:read' },
      { label: 'Sucursales', path: '/branches', icon: <GitBranch size={20} />, permission: 'branches:read' },
      { label: 'Almacenes', path: '/warehouses', icon: <Warehouse size={20} />, permission: 'warehouses:read' },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { label: 'Productos', path: '/products', icon: <Package size={20} />, permission: 'products:read' },
      { label: 'Categorías', path: '/categories', icon: <Tags size={20} />, permission: 'categories:read' },
      { label: 'Marcas', path: '/brands', icon: <Bookmark size={20} />, permission: 'brands:read' },
      { label: 'Unidades', path: '/units', icon: <Ruler size={20} />, permission: 'units:read' },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { label: 'Punto de Venta', path: '/pos', icon: <Store size={20} />, permission: 'sales:read' },
      { label: 'Clientes', path: '/customers', icon: <UserCheck size={20} />, permission: 'customers:read' },
      { label: 'Proveedores', path: '/suppliers', icon: <Truck size={20} />, permission: 'suppliers:read' },
      { label: 'Ventas', path: '/sales', icon: <ShoppingCart size={20} />, permission: 'sales:read' },
      { label: 'Compras', path: '/purchases', icon: <PackageSearch size={20} />, permission: 'purchases:read' },
    ],
  },
  {
    title: 'Inventario',
    items: [
      { label: 'Inventario', path: '/inventory', icon: <Package size={20} />, permission: 'inventory:read' },
      { label: 'Kardex', path: '/kardex', icon: <ScrollText size={20} />, permission: 'kardex:read' },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { label: 'Caja', path: '/cash', icon: <Wallet size={20} />, permission: 'cash:read' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Reportes', path: '/reports', icon: <BarChart3 size={20} />, permission: 'reports:read' },
      { label: 'Auditoría', path: '/audit', icon: <FileSearch size={20} />, permission: 'audit:read' },
      { label: 'Notificaciones', path: '/notifications', icon: <Bell size={20} />, permission: 'notifications:read' },
      { label: 'Configuración', path: '/settings', icon: <Settings size={20} />, permission: 'settings:read' },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { hasPermission } = useAuthStore();

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        {!collapsed && (
          <div className="sidebar__logo">
            <span className="sidebar__logo-icon">◆</span>
            <span className="sidebar__logo-text">GOCus</span>
          </div>
        )}
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar__nav">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.permission || hasPermission(item.permission),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="sidebar__section">
              {!collapsed && (
                <span className="sidebar__section-title">{section.title}</span>
              )}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  title={item.label}
                >
                  <span className="sidebar__link-icon">{item.icon}</span>
                  {!collapsed && (
                    <span className="sidebar__link-text">{item.label}</span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
