import { isTrustedCheckoutUrl } from '../payments/checkout-url';
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
  phone: z.string().optional(),
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

export const createPreorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.uuid(),
        quantity: z.number().int().positive().max(2147483647),
      }),
    )
    .min(1)
    .max(100)
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
      { message: 'Each book must appear only once.' },
    ),
  totalAmount: z.number().nonnegative().optional(),
  customer: z.object({
    fullName: z.string().trim().min(1).max(255),
    email: z.email().max(255).toLowerCase(),
    phone: z.string().trim().min(1).max(20).optional(),
    address: z.string().trim().min(1).max(255),
    city: z.string().trim().min(1).max(255),
    state: z.string().trim().min(1).max(255),
    note: z.string().trim().max(2000).optional(),
  }),
});

export const initiatePaymentSchema = z.object({ orderId: z.uuid() });
export const paymentReferenceSchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9.=-]+$/);

export const paystackVerifyResponseSchema = z.object({
  status: z.literal(true),
  data: z.object({
    reference: z.string(),
    status: z.enum([
      'success',
      'failed',
      'abandoned',
      'ongoing',
      'pending',
      'processing',
      'queued',
      'reversed',
    ]),
    amount: z.number().int().nonnegative(),
    currency: z.string(),
    customer: z.object({ email: z.email() }),
    paid_at: z.string().datetime({ offset: true }).nullable().optional(),
  }),
});

export const paystackInitializeResponseSchema = z.object({
  status: z.literal(true),
  data: z.object({
    reference: z.string(),
    authorization_url: z.url().refine((value) => {
      const url = new URL(value);
      return (
        url.protocol === 'https:' && url.hostname === 'checkout.paystack.com'
      );
    }),
  }),
});

export const preorderCheckoutResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    orderId: z.uuid(),
    paymentUrl: z.url().refine((value) => isTrustedCheckoutUrl(value)),
  }),
});

export const adminRecordsQuerySchema = z
  .object({
    kind: z.enum(['orders', 'waitlist']),
    page: z.coerce.number().int().min(0).max(1000000).default(0),
    pageSize: z.coerce
      .number()
      .pipe(z.union([z.literal(10), z.literal(25), z.literal(50)]))
      .default(10),
    search: z.string().trim().max(200).default(''),
    sort: z.string().default('createdAt'),
    direction: z.enum(['asc', 'desc']).default('desc'),
  })
  .refine(
    (query) =>
      (query.kind === 'orders'
        ? [
            'id',
            'reference',
            'customer',
            'email',
            'status',
            'payment',
            'createdAt',
          ]
        : ['name', 'email', 'phone', 'category', 'createdAt']
      ).includes(query.sort),
    { message: 'Invalid sort column.' },
  );
