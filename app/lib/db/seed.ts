import { log, logError } from '../logger';
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { db } from './index';
import { adminUsers, books, reviews } from './schema';

const SEED_DIR = path.join(process.cwd(), 'app/lib/db/seeds');

const seeders: Record<string, (rows: unknown[]) => Promise<void>> = {
  adminUsers: async (rows) => {
    await db.insert(adminUsers).values(rows as (typeof adminUsers.$inferInsert)[])
      .onConflictDoNothing({ target: adminUsers.email });
  },
  books: async (rows) => {
    for (const row of rows as (typeof books.$inferInsert)[]) {
      // Catalog edits made in the dashboard must survive subsequent deployments.
      await db.insert(books).values(row).onConflictDoNothing({ target: books.id });
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
    log('info', 'database.seed_completed');
  }
}

main().catch((error) => {
  logError('database.seed_failed', error);
  process.exitCode = 1;
});
