import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { db } from './index';
import { books, reviews } from './schema';

const SEED_DIR = path.join(process.cwd(), 'app/lib/db/seeds');

const seeders: Record<string, (rows: unknown[]) => Promise<void>> = {
  books: async (rows) => {
    for (const row of rows as (typeof books.$inferInsert)[]) {
      await db.insert(books).values(row).onConflictDoUpdate({
        target: books.id,
        set: {
          title: row.title,
          price: row.price,
          type: row.type,
          image: row.image,
          description: row.description,
        },
      });
    }
  },
  reviews: async (rows) => {
    for (const row of rows as (typeof reviews.$inferInsert)[]) {
      await db.insert(reviews).values(row).onConflictDoUpdate({
        target: reviews.id,
        set: {
          name: row.name,
          title: row.title,
          quote: row.quote,
          avatar: row.avatar,
          displayOrder: row.displayOrder,
        },
      });
    }
  },
};

async function main() {
  const files = fs
    .readdirSync(SEED_DIR)
    .filter((file) => file.endsWith('.ts'))
    .sort();

  for (const file of files) {
    const name = path.basename(file, '.ts');
    const seed = seeders[name];

    if (!seed) {
      throw new Error(`No table configured for ${file}`);
    }

    const fileUrl = pathToFileURL(path.join(SEED_DIR, file)).href;
    const { default: rows } = await import(fileUrl);

    if (!Array.isArray(rows)) {
      throw new Error(`${file} must export an array as default`);
    }

    if (rows.length === 0) continue;

    await seed(rows);
    console.log(`Seeded ${rows.length} records from ${file}`);
  }
}

main().catch((error) => {
  console.error('Seeding failed:', error);
  process.exitCode = 1;
});
