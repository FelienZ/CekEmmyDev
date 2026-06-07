import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const pempekCategory = await prisma.productCategory.upsert({
    where: {
      name: 'Pempek',
    },
    update: {},
    create: {
      name: 'Pempek',
    },
  });

  const minumanCategory = await prisma.productCategory.upsert({
    where: {
      name: 'Minuman',
    },
    update: {},
    create: {
      name: 'Minuman',
    },
  });

  await prisma.product.createMany({
    data: [
      {
        name: 'Pempek Kapal Selam',
        price: 9000,
        stock: 100,
        isAvailable: true,
        categoryId: pempekCategory.categoryId,
      },
      {
        name: 'Pempek Lenjer',
        price: 1500,
        stock: 100,
        isAvailable: true,
        categoryId: pempekCategory.categoryId,
      },
      {
        name: 'Tekwan',
        price: 9000,
        stock: 50,
        isAvailable: true,
        categoryId: pempekCategory.categoryId,
      },
      {
        name: 'Es Teh',
        price: 5000,
        stock: 200,
        isAvailable: true,
        categoryId: minumanCategory.categoryId,
      },
    ],
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
