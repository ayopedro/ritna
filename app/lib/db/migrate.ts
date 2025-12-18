import 'dotenv/config';
import { SQL } from 'bun';
import { drizzle } from 'drizzle-orm/bun-sql';
import { migrate } from 'drizzle-orm/bun-sql/migrator';

import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = new SQL(databaseUrl);
const db = drizzle({ client, schema });

// Run all pending Drizzle migrations using Bun's built-in postgres driver.
async function main() {
  try {
    await migrate(db, { migrationsFolder: './app/lib/db/migrations' });
    console.log('Migrations applied successfully');
  } catch (error) {
    console.error('Migration failed\n', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void main();
