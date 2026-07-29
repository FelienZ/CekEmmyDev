import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import Slugify from '@/helper/slugify';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await prisma.product.findMany();
  for (const product of products) {
    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        slug: Slugify(product.name),
      },
    });
  }

  //slug di kategori blm perlu, sebelumnya belum didefinisikan di tablenya
  /* const productCategories = await prisma.productCategory.findMany();
  for (const categories of productCategories) {
    await prisma.productCategory.update({
      where: {
        categoryId: categories.categoryId,
      },
      data: {
        slug: Slugify(categories.name),
      },
    });
  } */
}

main()
  .then(() => console.log('berhasil'))
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
