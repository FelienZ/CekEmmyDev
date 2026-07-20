import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.productCategory.upsert({
    where: {
      name: 'Pempek',
    },
    update: {},
    create: {
      name: 'Pempek',
    },
  });
  await prisma.productCategory.upsert({
    where: {
      name: 'Makanan Ringan',
    },
    update: {},
    create: {
      name: 'Makanan Ringan',
    },
  });
  await prisma.productCategory.upsert({
    where: {
      name: 'Minuman',
    },
    update: {},
    create: {
      name: 'Minuman',
    },
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
