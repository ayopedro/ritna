import { SQL } from 'bun';
import { drizzle } from 'drizzle-orm/bun-sql';
import { migrate } from 'drizzle-orm/bun-sql/migrator';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

async function runMigrations() {
  const maxRetries = 3;
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    const client = new SQL(databaseUrl!);
    const db = drizzle({ client, schema });

    try {
      console.log(`Migration attempt ${currentRetry + 1}...`);
      
      await client`SELECT 1`; 
      
      await migrate(db, { migrationsFolder: './app/lib/db/migrations' });
      
      console.log('✅ Migrations applied successfully');
      await client.end();
      return;
    } catch (error) {
      currentRetry++;
      console.error(`❌ Migration attempt ${currentRetry} failed:`, (error as Error).message);
      
      await client.end();
      
      if (currentRetry === maxRetries) {
        process.exit(1);
      }
      
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

void runMigrations();