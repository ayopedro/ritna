import { relations } from 'drizzle-orm';
import {
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

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  price: integer('price').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id),
  status: orderStatusEnum('orderStatus').default('pending'),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }),
});

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

export const books = pgTable('books', {
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
});

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
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
