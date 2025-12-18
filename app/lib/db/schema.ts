import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  varchar,
  pgEnum,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'completed',
  'canceled',
]);

export const customersTable = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
});

export const productsTable = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  price: integer('price').notNull(),
  createdAt: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
});

export const ordersTable = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customersTable.id),
  status: orderStatusEnum('order_status').default('pending'),
  createdAt: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
});

export const orderItemsTable = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => ordersTable.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => productsTable.id),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
});

export const customersRelations = relations(customersTable, ({ many }) => ({
  orders: many(ordersTable),
}));

export const productsRelations = relations(productsTable, ({ many }) => ({
  orderItems: many(orderItemsTable),
}));

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  customer: one(customersTable, {
    fields: [ordersTable.customerId],
    references: [customersTable.id],
  }),
  orderItems: many(orderItemsTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.orderId],
    references: [ordersTable.id],
  }),
  product: one(productsTable, {
    fields: [orderItemsTable.productId],
    references: [productsTable.id],
  }),
}));
