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
  // 4. Crear sucursales (Sedes)
  // ──────────────────────────────────────────
  console.log('🏪 Creando sucursales (Sedes)...');
  const branchesData = [
    { name: 'Sucursal Principal (Cusco)', code: 'CUS-001', address: 'Cusco Centro' },
    { name: 'Sucursal Juliaca', code: 'JUL-001', address: 'Juliaca Centro' },
    { name: 'Sucursal Puerto Maldonado', code: 'PEM-001', address: 'Puerto Maldonado Centro' },
  ];

  const createdBranches: Record<string, string> = {};

  for (const branchData of branchesData) {
    const branch = await prisma.branch.upsert({
      where: {
        companyId_name: {
          companyId: company.id,
          name: branchData.name,
        },
      },
      update: {},
      create: {
        name: branchData.name,
        code: branchData.code,
        address: branchData.address,
        phone: '+1234567890',
        email: `${branchData.code.toLowerCase()}@gocus.com`,
        companyId: company.id,
      },
    });
    createdBranches[branchData.code] = branch.id;
    console.log(`   ✅ Sucursal "${branch.name}" creada`);
  }

  // Obtenemos la rama principal (Cusco) para los almacenes y usuarios por defecto
  const branchId = createdBranches['CUS-001'];

  // ──────────────────────────────────────────
  // 5. Crear almacenes por cada sede
  // ──────────────────────────────────────────
  console.log('📦 Creando almacenes...');
  const createdWarehouses: Record<string, string> = {};

  for (const branchData of branchesData) {
    const bId = createdBranches[branchData.code];
    const warehouse = await prisma.warehouse.upsert({
      where: {
        branchId_name: {
          branchId: bId,
          name: `Almacén ${branchData.name}`,
        },
      },
      update: {},
      create: {
        name: `Almacén ${branchData.name}`,
        code: `ALM-${branchData.code}`,
        address: `Dentro de ${branchData.name}`,
        branchId: bId,
      },
    });
    createdWarehouses[branchData.code] = warehouse.id;
    console.log(`   ✅ Almacén "${warehouse.name}" creado`);
  }

  // Almacén principal
  const warehouseId = createdWarehouses['CUS-001'];

  // ──────────────────────────────────────────
  // 6. Crear Administradores
  // ──────────────────────────────────────────
  console.log('👤 Creando Administradores...');
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  // 1. Admin Default
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
      branchId: branchId,
    },
  });
  console.log('   ✅ Usuario admin@gocus.com / Admin123!');

  // 2. Gonzalo
  await prisma.user.upsert({
    where: { email: 'gonzalo@gocus.com' },
    update: {},
    create: {
      email: 'gonzalo@gocus.com',
      password: hashedPassword,
      firstName: 'Gonzalo',
      lastName: 'Admin',
      roleId: roleIds['Super Administrador'],
      companyId: company.id,
      branchId: branchId,
    },
  });
  console.log('   ✅ Usuario gonzalo@gocus.com / Admin123!');

  // 3. JuniDev
  await prisma.user.upsert({
    where: { email: 'junidev@gocus.com' },
    update: {},
    create: {
      email: 'junidev@gocus.com',
      password: hashedPassword,
      firstName: 'JuniDev',
      lastName: 'Admin',
      roleId: roleIds['Super Administrador'],
      companyId: company.id,
      branchId: branchId,
    },
  });
  console.log('   ✅ Usuario junidev@gocus.com / Admin123!');

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

  // ──────────────────────────────────────────
  // 8. Crear Marcas y Unidades
  // ──────────────────────────────────────────
  console.log('🔖 Creando marcas y unidades...');
  const brandStarlink = await prisma.brand.upsert({
    where: { name: 'Starlink' },
    update: {},
    create: { name: 'Starlink' }
  });
  const brandLogitech = await prisma.brand.upsert({
    where: { name: 'Logitech' },
    update: {},
    create: { name: 'Logitech' }
  });
  const brandTplink = await prisma.brand.upsert({
    where: { name: 'TP-Link' },
    update: {},
    create: { name: 'TP-Link' }
  });

  const unitUnd = await prisma.unit.upsert({
    where: { name: 'Unidad' },
    update: {},
    create: { name: 'Unidad', abbreviation: 'UND' }
  });
  console.log('   ✅ Marcas y unidades creadas');

  // ──────────────────────────────────────────
  // 9. Crear Productos Semilla y Stock
  // ──────────────────────────────────────────
  console.log('📦 Creando productos semilla y stock...');
  const catStarlink = await prisma.category.findFirst({ where: { name: 'STARLINK' } });
  const catRedes = await prisma.category.findFirst({ where: { name: 'EQUIPOS DE RED' } });
  const catPerifericos = await prisma.category.findFirst({ where: { name: 'PERIFERICOS' } });

  const productsData = [
    {
      name: 'STARLINK MINI INTERNET SATELITAL',
      sku: 'SL-MINI-01',
      barcode: '741258963001',
      purchasePrice: 800.00,
      salePrice: 990.00,
      categoryId: catStarlink?.id,
      brandId: brandStarlink.id,
      unitId: unitUnd.id,
      stock: 10
    },
    {
      name: 'ROUTER TP-LINK ARCHER C50 AC1200',
      sku: 'TPL-AC1200',
      barcode: '741258963002',
      purchasePrice: 90.00,
      salePrice: 120.00,
      categoryId: catRedes?.id,
      brandId: brandTplink.id,
      unitId: unitUnd.id,
      stock: 25
    },
    {
      name: 'MOUSE LOGITECH G502 HERO',
      sku: 'LOG-G502',
      barcode: '741258963003',
      purchasePrice: 130.00,
      salePrice: 185.00,
      categoryId: catPerifericos?.id,
      brandId: brandLogitech.id,
      unitId: unitUnd.id,
      stock: 15
    }
  ];

  for (const pData of productsData) {
    const { stock, ...prodFields } = pData;
    const product = await prisma.product.upsert({
      where: { sku: prodFields.sku },
      update: {},
      create: {
        ...prodFields,
        branchId: branchId,
      }
    });

    // Agregar inventario inicial
    await prisma.inventory.upsert({
      where: {
        productId_warehouseId: {
          productId: product.id,
          warehouseId: warehouseId,
        }
      },
      update: { quantity: stock },
      create: {
        quantity: stock,
        productId: product.id,
        warehouseId: warehouseId,
        branchId: branchId,
      }
    });
  }
  console.log('   ✅ Productos y stock creados');

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
