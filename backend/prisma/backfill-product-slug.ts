import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import Slugify from '@/helper/slugify';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = await prisma.productCategory.findMany({
    where: {
      slug: null,
    },
    select: {
      categoryId: true,
      name: true,
      slug: true,
    },
  });

  console.log(`Found ${categories.length} categories to backfill.`);

  const generatedSlugs = new Map<string, string>();

  for (const category of categories) {
    const slug = Slugify(category.name);

    if (!slug) {
      throw new Error(
        `Cannot generate slug for category "${category.name}" (${category.categoryId})`,
      );
    }

    const existing = generatedSlugs.get(slug);

    if (existing) {
      throw new Error(
        `Slug collision detected: "${slug}" would be generated for both "${existing}" and "${category.name}".`,
      );
    }

    generatedSlugs.set(slug, category.name);

    const slugOwner = await prisma.productCategory.findFirst({
      where: {
        slug,
        NOT: {
          categoryId: category.categoryId,
        },
      },
      select: {
        categoryId: true,
        name: true,
      },
    });

    if (slugOwner) {
      throw new Error(
        `Slug collision detected: "${slug}" already belongs to category "${slugOwner.name}" (${slugOwner.categoryId}).`,
      );
    }

    await prisma.productCategory.update({
      where: {
        categoryId: category.categoryId,
      },
      data: {
        slug,
      },
    });

    console.log(`Updated: "${category.name}" → "${slug}"`);
  }

  const remaining = await prisma.productCategory.count({
    where: {
      slug: null,
    },
  });

  if (remaining > 0) {
    throw new Error(
      `Backfill incomplete. ${remaining} categories still have NULL slug.`,
    );
  }

  console.log('ProductCategory slug backfill completed successfully.');
}

main()
  .catch((error) => {
    console.error('ProductCategory slug backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });