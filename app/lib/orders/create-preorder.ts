import { withSpan } from '../telemetry/tracing';
import { log } from '@/app/lib/logger';
import { createHash } from 'node:crypto';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/app/lib/db';
import { books, customers, orders, orderItems } from '@/app/lib/db/schema';
import { AVAILABLE_BOOK_EDITIONS } from '@/app/lib/constants';
import type { PreorderRecord, ValidatedPreorder } from '@/app/lib/types';

export async function createPreorder(
  input: ValidatedPreorder,
  idempotencyKey: string,
) {
  const { customer, items } = input;
  const requestHash = createHash('sha256')
    .update(
      JSON.stringify({
        customer,
        items: [...items].sort((a, b) => a.id.localeCompare(b.id)),
      }),
    )
    .digest('hex');

  const result = await withSpan(
    'db.create_preorder',
    { 'db.system.name': 'postgresql', 'db.operation.name': 'transaction' },
    () =>
      db.transaction(async (tx) => {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtextextended(${idempotencyKey}, 0))`,
        );
        const [existing] = await tx
          .select()
          .from(orders)
          .where(eq(orders.idempotencyKey, idempotencyKey))
          .limit(1);
        if (existing) {
          if (existing.requestHash !== requestHash) {
            return {
              error:
                'This idempotency key was already used for a different order.',
              status: 409,
            } as const;
          }
          return { order: existing, status: 200 } as const;
        }

        const catalog = await tx
          .select()
          .from(books)
          .where(
            inArray(
              books.id,
              items.map((item) => item.id),
            ),
          );
        if (
          catalog.length !== items.length ||
          catalog.some((book) => !AVAILABLE_BOOK_EDITIONS.includes(book.type))
        ) {
          return {
            error: 'One or more books are unavailable for preorder.',
            status: 422,
          } as const;
        }
        const prices = new Map(catalog.map((book) => [book.id, book.price]));
        const lines = items.map((item) => ({
          bookId: item.id,
          quantity: item.quantity,
          unitPrice: prices.get(item.id)!,
        }));
        const totalAmount = lines.reduce(
          (total, item) => total + item.unitPrice * item.quantity,
          0,
        );
        if (
          !Number.isSafeInteger(totalAmount) ||
          totalAmount <= 0 ||
          totalAmount > 2147483647
        ) {
          return {
            error: 'The order total is outside the supported range.',
            status: 422,
          } as const;
        }

        const [firstName, ...rest] = customer.fullName.split(/\s+/);
        const [insertedCustomer] = await tx
          .insert(customers)
          .values({
            firstName,
            lastName: rest.join(' '),
            email: customer.email,
            phone: customer.phone,
          })
          .onConflictDoNothing({ target: customers.email })
          .returning({ id: customers.id });
        const savedCustomer =
          insertedCustomer ??
          (
            await tx
              .select({ id: customers.id })
              .from(customers)
              .where(eq(customers.email, customer.email))
              .limit(1)
          )[0];
        if (!savedCustomer) throw new Error('Customer could not be resolved.');

        let order: PreorderRecord | undefined;
        // A collision only retries reference allocation, preserving order idempotency.
        for (let attempt = 0; attempt < 3; attempt++) {
          [order] = await tx
            .insert(orders)
            .values({
              customerId: savedCustomer.id,
              idempotencyKey: idempotencyKey,
              requestHash,
              totalAmount,
              currency: 'NGN',
              shippingFullName: customer.fullName,
              shippingEmail: customer.email,
              shippingPhone: customer.phone,
              shippingAddressLine1: customer.address,
              shippingCity: customer.city,
              shippingState: customer.state,
              shippingNotes: customer.note,
            })
            .onConflictDoNothing({ target: orders.reference })
            .returning();
          if (order) break;
        }
        if (!order)
          throw new Error('Could not allocate a unique order reference.');
        await tx
          .insert(orderItems)
          .values(lines.map((line) => ({ ...line, orderId: order.id })));
        return { order, status: 201 } as const;
      }),
  );
  if (result.order)
    log('info', result.status === 201 ? 'order.created' : 'order.reused', {
      orderId: result.order.id,
    });
  return result;
}
