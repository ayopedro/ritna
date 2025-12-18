import 'dotenv/config';
import { drizzle } from 'drizzle-orm/bun-sql';
import * as schema from './schema';
import { SQL } from 'bun';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = new SQL({ url: databaseUrl, idleTimeout: 5000 });

const db = drizzle({ client, schema });

export default db;
