import type { ConfirmationEmailPayload } from '@/app/lib/types';
import { relations, sql } from 'drizzle-orm';
import {
  jsonb,
  check,
  index,
  unique,
  integer,
  pgTable,
  varchar,
  pgEnum,
  timestamp,
  text,
  uuid,
} from 'drizzle-orm/pg-core';

export const orderStatusEnum = pgEnum('orderStatus', [
  'pending',
  'completed',
  'canceled',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'failed',
  'canceled',
]);

export const categoryEnum = pgEnum('category', ['civilian', 'military']);

export const bookTypeEnum = pgEnum('bookType', [
  'hardcover',
  'softcover',
  'institutional',
]);

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
});

export const customerAddress = pgTable(
  'customer_addresses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id),
    addressLine1: varchar('address_line_1', { length: 255 }).notNull(),
    addressLine2: varchar('address_line_2', { length: 255 }),
    city: varchar('city', { length: 255 }).notNull(),
    state: varchar('state', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
  },
  (table) => [index('customer_addresses_customer_id_idx').on(table.customerId)],
);

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 1000 }),
    price: integer('price').notNull(),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
  },
  (table) => [check('products_price_nonnegative', sql`${table.price} >= 0`)],
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reference: varchar('reference', { length: 32 })
      .notNull()
      .unique()
      .default(
        sql`'RITNA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))`,
      ),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id),
    status: orderStatusEnum('orderStatus').default('pending').notNull(),
    paymentStatus: paymentStatusEnum('payment_status')
      .default('pending')
      .notNull(),
    totalAmount: integer('total_amount').notNull(),
    currency: varchar('currency', { length: 3 }).default('NGN').notNull(),
    idempotencyKey: varchar('idempotency_key', { length: 255 })
      .notNull()
      .unique(),
    requestHash: varchar('request_hash', { length: 64 }).notNull(),
    shippingFullName: varchar('shipping_full_name', { length: 255 }).notNull(),
    shippingEmail: varchar('shipping_email', { length: 255 }).notNull(),
    shippingPhone: varchar('shipping_phone', { length: 20 }),
    shippingAddressLine1: varchar('shipping_address_line_1', {
      length: 255,
    }).notNull(),
    shippingAddressLine2: varchar('shipping_address_line_2', { length: 255 }),
    shippingCity: varchar('shipping_city', { length: 255 }).notNull(),
    shippingState: varchar('shipping_state', { length: 255 }).notNull(),
    shippingNotes: text('shipping_notes'),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
  },
  (table) => [
    index('orders_customer_id_idx').on(table.customerId),
    check('orders_total_amount_nonnegative', sql`${table.totalAmount} >= 0`),
    check('orders_currency_ngn', sql`${table.currency} = 'NGN'`),
  ],
);

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id),
    bookId: uuid('book_id')
      .notNull()
      .references(() => books.id),
    unitPrice: integer('unit_price').notNull(),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
  },
  (table) => [
    unique('order_items_order_book_unique').on(table.orderId, table.bookId),
    check('order_items_quantity_positive', sql`${table.quantity} > 0`),
    check('order_items_unit_price_nonnegative', sql`${table.unitPrice} >= 0`),
  ],
);

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id),
    provider: varchar('provider', { length: 50 }).notNull(),
    providerReference: varchar('provider_reference', { length: 255 })
      .notNull()
      .unique(),
    idempotencyKey: varchar('idempotency_key', { length: 255 })
      .notNull()
      .unique(),
    amount: integer('amount').notNull(),
    currency: varchar('currency', { length: 3 }).default('NGN').notNull(),
    status: paymentStatusEnum('status').default('pending').notNull(),
    authorizationUrl: text('authorization_url'),
    providerCheckoutId: varchar('provider_checkout_id', { length: 255 }),
    paidAt: timestamp('paid_at', { precision: 6, withTimezone: true }),
    createdAt: timestamp('created_at', { precision: 6, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
  },
  (table) => [
    index('payments_order_id_idx').on(table.orderId),
    check('payments_amount_positive', sql`${table.amount} > 0`),
    check('payments_currency_ngn', sql`${table.currency} = 'NGN'`),
  ],
);

export const waitlist = pgTable('waitlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  category: categoryEnum('category').default('civilian').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
});

export const books = pgTable(
  'books',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    price: integer('price').notNull(),
    type: bookTypeEnum('bookType').default('hardcover').notNull(),
    image: varchar('image', { length: 255 }),
    description: varchar('description', { length: 1000 }),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
  },
  (table) => [check('books_price_nonnegative', sql`${table.price} >= 0`)],
);

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  quote: text('quote').notNull(),
  avatar: varchar('avatar', { length: 255 }).notNull(),
  displayOrder: integer('display_order').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
});

export const customersRelations = relations(customers, ({ many }) => ({
  addresses: many(customerAddress),
  orders: many(orders),
}));

export const booksRelations = relations(books, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  orderItems: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  book: one(books, {
    fields: [orderItems.bookId],
    references: [books.id],
  }),
}));

export const customerAddressRelations = relations(
  customerAddress,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerAddress.customerId],
      references: [customers.id],
    }),
  }),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const orderConfirmationEmails = pgTable('order_confirmation_emails', {
  orderId: uuid('order_id')
    .primaryKey()
    .references(() => orders.id),
  payload: jsonb('payload').$type<ConfirmationEmailPayload>().notNull(),
  providerId: varchar('provider_id', { length: 255 }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
