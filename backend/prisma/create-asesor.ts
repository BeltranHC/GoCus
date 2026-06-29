import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando usuario Asesor...');

  const branch = await prisma.branch.findFirst();
  if (!branch) {
    console.error('❌ No se encontró ninguna sucursal.');
    return;
  }

  const roleAsesor = await prisma.role.findFirst({
    where: { name: 'Asesor (Vendedor)' }
  });

  if (!roleAsesor) {
    console.error('❌ No se encontró el rol "Asesor (Vendedor)".');
    return;
  }

  const hashedPassword = await bcrypt.hash('Asesor123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'asesor@gocus.com' },
    update: {
      password: hashedPassword,
      roleId: roleAsesor.id,
      branchId: branch.id,
      companyId: branch.companyId,
    },
    create: {
      email: 'asesor@gocus.com',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Pérez (Asesor)',
      roleId: roleAsesor.id,
      branchId: branch.id,
      companyId: branch.companyId,
    },
  });

  console.log(`✅ Asesor creado exitosamente: ${user.email} / Asesor123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
