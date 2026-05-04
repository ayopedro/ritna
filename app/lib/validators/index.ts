import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import * as schema from '../db/schema';
import * as z from 'zod';

export const CustomerSelectSchema = createSelectSchema(schema.customers);
export const CustomersSelectArraySchema = CustomerSelectSchema.array();
export const CustomerInsertSchema = createInsertSchema(schema.customers, {
  firstName: z.string('First name is required'),
  lastName: z.string('Last name is required'),
  email: z.email({
    error: (iss) =>
      !iss.input ? 'Email is required' : 'Invalid email address',
  }),
  phone: z
    .string()
    .optional(),
});
export const CustomerUpdateSchema = createUpdateSchema(schema.customers);

export const OrderSelectSchema = createSelectSchema(schema.orders);
export const OrderInsertSchema = createInsertSchema(schema.orders);
export const OrderUpdateSchema = createUpdateSchema(schema.orders);

export const ProductSelectSchema = createSelectSchema(schema.products);
export const ProductInsertSchema = createInsertSchema(schema.products);
export const ProductUpdateSchema = createUpdateSchema(schema.products);

export const OrderItemSelectSchema = createSelectSchema(schema.orderItems);
export const OrderItemInsertSchema = createInsertSchema(schema.orderItems);
export const OrderItemUpdateSchema = createUpdateSchema(schema.orderItems);

export const waitlistSchema = z.object({
  firstName: z.string('First name is required'),
  lastName: z.string('Last name is required'),
  email: z.email({
    error: (iss) =>
      !iss.input ? 'Email is required' : 'Invalid email address',
  }),
  phone: z
    .string({
      error: 'Phone number is required',
    })
    .min(1, 'Phone number is required')
    .regex(/^(?:\+?[1-9]\d{0,2}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?){1,2}\d{4}$/, {
      error: 'Invalid phone number format',
    }),
  category: z.enum(['civilian', 'military'], {
    error: 'Category is required',
  }),
});
