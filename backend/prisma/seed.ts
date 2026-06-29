// ============================================
// GOCus ERP/POS — Seed de Base de Datos
// ============================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ──────────────────────────────────────────
// Definición de módulos y acciones
// ──────────────────────────────────────────
const MODULES = [
  'users',
  'roles',
  'permissions',
  'companies',
  'branches',
  'warehouses',
  'products',
  'categories',
  'brands',
  'units',
  'customers',
  'suppliers',
  'sales',
  'purchases',
  'inventory',
  'kardex',
  'cash',
  'dashboard',
  'reports',
  'audit',
  'notifications',
  'settings',
];

const ACTIONS = ['create', 'read', 'update', 'delete'];

// ──────────────────────────────────────────
// Roles del sistema
// ──────────────────────────────────────────
const ROLES = [
  {
    name: 'Super Administrador',
    description: 'Acceso total al sistema. Gestiona todas las empresas y configuraciones.',
    isSystem: true,
    allPermissions: true,
  },
  {
    name: 'Asesor (Vendedor)',
    description: 'Solo puede crear Ventas, ver Clientes y consultar el Stock de su sucursal.',
    isSystem: true,
    modules: ['sales', 'customers', 'products', 'inventory', 'cash'],
    actions: ['create', 'read'],
  },
];

async function main() {
  console.log('🌱 Iniciando seed de GOCus...');

  // ──────────────────────────────────────────
  // 1. Crear permisos
  // ──────────────────────────────────────────
  console.log('📋 Creando permisos...');
  const permissions: Record<string, string> = {};

  for (const module of MODULES) {
    for (const action of ACTIONS) {
      const permission = await prisma.permission.upsert({
        where: { module_action: { module, action } },
        update: {},
        create: {
          module,
          action,
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module}`,
        },
      });
      permissions[`${module}:${action}`] = permission.id;
    }
  }
  console.log(`   ✅ ${Object.keys(permissions).length} permisos creados`);

  // ──────────────────────────────────────────
  // 2. Crear roles y asignar permisos
  // ──────────────────────────────────────────
  console.log('🔐 Creando roles...');
  const roleIds: Record<string, string> = {};

  for (const roleDef of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description },
      create: {
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
    });
    roleIds[roleDef.name] = role.id;

    // Determinar qué permisos asignar
    let permissionKeys: string[] = [];

    if (roleDef.allPermissions) {
      permissionKeys = Object.keys(permissions);
    } else if (roleDef.modules) {
      const actions = roleDef.actions || ACTIONS;
      for (const module of roleDef.modules) {
        for (const action of actions) {
          const key = `${module}:${action}`;
          if (permissions[key]) {
            permissionKeys.push(key);
          }
        }
      }
    }

    // Asignar permisos al rol
    for (const key of permissionKeys) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permissions[key],
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permissions[key],
        },
      });
    }

    console.log(`   ✅ Rol "${roleDef.name}" — ${permissionKeys.length} permisos`);
  }

  // ──────────────────────────────────────────
  // 3. Crear empresa demo
  // ──────────────────────────────────────────
  console.log('🏢 Creando empresa demo...');
  const company = await prisma.company.upsert({
    where: { name: 'GOCus Demo' },
    update: {},
    create: {
      name: 'GOCus Demo',
      tradeName: 'GOCus',
      taxId: '00000000000',
      email: 'info@gocus.com',
      phone: '+1234567890',
      address: 'Dirección de ejemplo',
    },
  });
  console.log(`   ✅ Empresa "${company.name}" creada`);

  // ──────────────────────────────────────────
  // 4. Crear sucursal principal
  // ──────────────────────────────────────────
  console.log('🏪 Creando sucursal principal...');
  const branch = await prisma.branch.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'Sucursal Principal',
      },
    },
    update: {},
    create: {
      name: 'Sucursal Principal',
      code: 'SUC-001',
      address: 'Dirección sucursal principal',
      phone: '+1234567890',
      email: 'principal@gocus.com',
      companyId: company.id,
    },
  });
  console.log(`   ✅ Sucursal "${branch.name}" creada`);

  // ──────────────────────────────────────────
  // 5. Crear almacén principal
  // ──────────────────────────────────────────
  console.log('📦 Creando almacén principal...');
  const warehouse = await prisma.warehouse.upsert({
    where: {
      branchId_name: {
        branchId: branch.id,
        name: 'Almacén Principal',
      },
    },
    update: {},
    create: {
      name: 'Almacén Principal',
      code: 'ALM-001',
      address: 'Dentro de la sucursal principal',
      branchId: branch.id,
    },
  });
  console.log(`   ✅ Almacén "${warehouse.name}" creado`);

  // ──────────────────────────────────────────
  // 6. Crear Super Administrador
  // ──────────────────────────────────────────
  console.log('👤 Creando Super Administrador...');
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@gocus.com' },
    update: {},
    create: {
      email: 'admin@gocus.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Administrador',
      roleId: roleIds['Super Administrador'],
      companyId: company.id,
      branchId: branch.id,
    },
  });
  console.log('   ✅ Usuario admin@gocus.com / Admin123!');

  // ──────────────────────────────────────────
  // 7. Crear Categorías
  // ──────────────────────────────────────────
  console.log('📂 Creando categorías...');
  const categoriesToSeed = [
    {
      name: 'CUSCOGO GAMER',
      icon: 'gamepad-2',
      subcategories: ['PERIFERICOS', 'MONITORES', 'LAPTOPS GAMER', 'SILLAS GAMER', 'ESCRITORIOS GAMER', 'PC DE ESCRITORIO']
    },
    {
      name: 'COMPONENTES DE PC',
      icon: 'cpu',
      subcategories: ['PLACAS MADRE', 'PROCESADORES', 'ALMACENAMIENTO', 'MEMORIAS RAM', 'REFRIGERACIÓN', 'TARJETAS DE VIDEO', 'CASE', 'FUENTES DE PODER', 'ACCESORIOS DE PC', 'PC DE ESCRITORIO']
    },
    {
      name: 'ENERGIA SOLAR RESIDENCIAL',
      icon: 'sun',
      subcategories: ['PANELES SOLARES FIJOS', 'KIT SOLAR RESIDENCIAL', 'INVERSORES SOLARES']
    },
    {
      name: 'ENERGÍA SOLAR PORTÁTIL',
      icon: 'battery-charging',
      subcategories: ['KITS DE ENERGÍA PORTÁTIL', 'ACCESORIOS ESTACIONES DE ENERGÍA', 'ESTACIONES DE ENERGÍA PORTÁTILES', 'BATERÍAS DE EXPANSIÓN', 'PANELES SOLARES']
    },
    { name: 'MOVILIDAD ELÉCTRICA', icon: 'bike', subcategories: [] },
    { name: 'STARLINK', icon: 'satellite', subcategories: [] },
    { name: 'ELECTROHOGAR', icon: 'home', subcategories: [] },
    { name: 'EQUIPOS DE RED', icon: 'wifi', subcategories: [] },
    { name: 'PROTECTOR ELECTRICO', icon: 'zap', subcategories: [] },
    { name: 'CAMARAS DE SEGURIDAD', icon: 'cctv', subcategories: [] }
  ];

  for (const cat of categoriesToSeed) {
    let parentCat = await prisma.category.findFirst({ where: { name: cat.name } });
    if (!parentCat) {
      parentCat = await prisma.category.create({
        data: { name: cat.name, icon: cat.icon }
      });
    } else {
      parentCat = await prisma.category.update({
        where: { id: parentCat.id },
        data: { icon: cat.icon }
      });
    }

    for (const sub of cat.subcategories) {
      const existingSub = await prisma.category.findFirst({ where: { name: sub, parentId: parentCat.id } });
      if (!existingSub) {
        await prisma.category.create({
          data: { name: sub, parentId: parentCat.id }
        });
      }
    }
  }
  console.log('   ✅ Categorías y subcategorías creadas');

  console.log('\n🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
