import { expect, test } from 'bun:test';
import { PgDialect } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { adminRecordsQuerySchema } from '../../app/lib/validators';
import { adminRecordQuery } from '../../app/lib/admin/query';

test('pagination validates bounds and entity-specific sort fields', () => {
  expect(adminRecordsQuerySchema.parse({ kind: 'orders' })).toMatchObject({ page: 0, pageSize: 10, sort: 'createdAt', direction: 'desc' });
  for (const input of [{ page: -1 }, { pageSize: 10000 }, { sort: 'phone' }, { direction: 'invalid' }, { search: 'a'.repeat(201) }]) {
    expect(adminRecordsQuerySchema.safeParse({ kind: 'orders', ...input }).success).toBe(false);
  }
  expect(adminRecordsQuerySchema.safeParse({ kind: 'waitlist', sort: 'phone', pageSize: '25', page: '2' }).success).toBe(true);
});

test('search is parameterized and wildcards are escaped', () => {
  const query = adminRecordsQuerySchema.parse({ kind: 'orders', search: "50%_O'Reilly", sort: 'payment' });
  const parts = adminRecordQuery(query);
  const compiled = new PgDialect().sqlToQuery(sql`select 1 where ${parts.where} order by ${sql.join(parts.orderBy, sql`, `)}`);
  expect(compiled.sql).not.toContain("O'Reilly");
  expect(compiled.params).toContain("%50\\%\\_O'Reilly%");
  expect(compiled.sql).toContain('"orders"."id" asc');
});
