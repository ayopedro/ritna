import { log, logError } from '../logger';
import { SQL } from 'bun';
import { drizzle } from 'drizzle-orm/bun-sql';
import { migrate } from 'drizzle-orm/bun-sql/migrator';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  log('error', 'database.configuration_missing');
  process.exit(1);
}

async function runMigrations() {
  const maxRetries = 3;
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    const client = new SQL(databaseUrl!);
    const db = drizzle({ client, schema });

    try {
      log('info', 'database.migration_started');
      
      await client`SELECT 1`; 
      
      await migrate(db, { migrationsFolder: './app/lib/db/migrations' });
      
      log('info', 'database.migration_completed');
      await client.end();
      return;
    } catch (error) {
      currentRetry++;
      logError('database.migration_failed', error);
      
      await client.end();
      
      if (currentRetry === maxRetries) {
        process.exit(1);
      }
      
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

void runMigrations();