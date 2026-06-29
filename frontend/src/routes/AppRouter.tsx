// ============================================
// GOCus — Router
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { LoginPage } from '../modules/auth/LoginPage';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { PosPage } from '../modules/sales/pages/PosPage';
import { ProductsPage } from '../modules/products/pages/ProductsPage';
import { CategoriesPage } from '../modules/categories/pages/CategoriesPage';
import { BrandsPage } from '../modules/brands/pages/BrandsPage';
import { UnitsPage } from '../modules/units/pages/UnitsPage';
import { UsersPage } from '../modules/users/pages/UsersPage';
import { RolesPage } from '../modules/roles/pages/RolesPage';
import { CompaniesPage } from '../modules/companies/pages/CompaniesPage';
import { BranchesPage } from '../modules/branches/pages/BranchesPage';
import { WarehousesPage } from '../modules/warehouses/pages/WarehousesPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/units" element={<UnitsPage />} />
          
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/warehouses" element={<WarehousesPage />} />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
