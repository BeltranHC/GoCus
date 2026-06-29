// ============================================
// GOCus ERP/POS — Root Module
// ============================================

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// Infrastructure
import { AppConfigModule } from '../config';
import { DatabaseModule } from '../database';
import { JwtAuthGuard, PermissionsGuard } from '../common/guards';

// Feature Modules
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { RolesModule } from '../modules/roles/roles.module';
import { PermissionsModule } from '../modules/permissions/permissions.module';
import { CompaniesModule } from '../modules/companies/companies.module';
import { BranchesModule } from '../modules/branches/branches.module';

// Stub Modules
import { WarehousesModule } from '../modules/warehouses/warehouses.module';
import { ProductsModule } from '../modules/products/products.module';
import { CategoriesModule } from '../modules/categories/categories.module';
import { BrandsModule } from '../modules/brands/brands.module';
import { UnitsModule } from '../modules/units/units.module';
import { CustomersModule } from '../modules/customers/customers.module';
import { SuppliersModule } from '../modules/suppliers/suppliers.module';
import { SalesModule } from '../modules/sales/sales.module';
import { PurchasesModule } from '../modules/purchases/purchases.module';
import { InventoryModule } from '../modules/inventory/inventory.module';
import { KardexModule } from '../modules/kardex/kardex.module';
import { CashModule } from '../modules/cash/cash.module';
import { DashboardModule } from '../modules/dashboard/dashboard.module';
import { ReportsModule } from '../modules/reports/reports.module';
import { AuditModule } from '../modules/audit/audit.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { SettingsModule } from '../modules/settings/settings.module';

import { AppController } from './app.controller';

@Module({
  imports: [
    // ── Infrastructure ──
    AppConfigModule,
    DatabaseModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

    // ── Core Modules ──
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    CompaniesModule,
    BranchesModule,

    // ── Stub Modules ──
    WarehousesModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    UnitsModule,
    CustomersModule,
    SuppliersModule,
    SalesModule,
    PurchasesModule,
    InventoryModule,
    KardexModule,
    CashModule,
    DashboardModule,
    ReportsModule,
    AuditModule,
    NotificationsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    // ── Global Guards ──
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
