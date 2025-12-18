import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import * as schema from './db/schema';
import * as z from 'zod';

const CustomerSelectSchema = createSelectSchema(schema.customers);
const CustomersSelectArraySchema = CustomerSelectSchema.array();
const CustomerInsertSchema = createInsertSchema(schema.customers, {
  firstName: z.string('First name is required'),
  lastName: z.string('Last name is required'),
  email: z.email({
    error: (iss) =>
      !iss.input ? 'Email is required' : 'Invalid email address',
  }),
  phone: z
    .string()
    .regex(/^(?:\+?[1-9]\d{0,2}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?){1,2}\d{4}$/, {
      error: 'Invalid phone number format',
    })
    .optional(),
});
const CustomerUpdateSchema = createUpdateSchema(schema.customers);

const OrderSelectSchema = createSelectSchema(schema.orders);
const OrderInsertSchema = createInsertSchema(schema.orders);
const OrderUpdateSchema = createUpdateSchema(schema.orders);

const ProductSelectSchema = createSelectSchema(schema.products);
const ProductInsertSchema = createInsertSchema(schema.products);
const ProductUpdateSchema = createUpdateSchema(schema.products);

const OrderItemSelectSchema = createSelectSchema(schema.orderItems);
const OrderItemInsertSchema = createInsertSchema(schema.orderItems);
const OrderItemUpdateSchema = createUpdateSchema(schema.orderItems);

export {
  CustomerSelectSchema,
  CustomersSelectArraySchema,
  CustomerInsertSchema,
  CustomerUpdateSchema,
  OrderSelectSchema,
  OrderInsertSchema,
  OrderUpdateSchema,
  ProductSelectSchema,
  ProductInsertSchema,
  ProductUpdateSchema,
  OrderItemSelectSchema,
  OrderItemInsertSchema,
  OrderItemUpdateSchema,
};
