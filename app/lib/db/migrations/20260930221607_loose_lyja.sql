CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'canceled');--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"address_line_1" varchar(255) NOT NULL,
	"address_line_2" varchar(255),
	"city" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"updated_at" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "order_confirmation_emails" (
	"order_id" uuid PRIMARY KEY NOT NULL,
	"payload" jsonb NOT NULL,
	"provider_id" varchar(255),
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_reference" varchar(255) NOT NULL,
	"idempotency_key" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"authorization_url" text,
	"paid_at" timestamp (6) with time zone,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone,
	CONSTRAINT "payments_provider_reference_unique" UNIQUE("provider_reference"),
	CONSTRAINT "payments_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "payments_amount_positive" CHECK ("payments"."amount" > 0),
	CONSTRAINT "payments_currency_ngn" CHECK ("payments"."currency" = 'NGN')
);
--> statement-breakpoint
ALTER TABLE "order_items" RENAME COLUMN "product_id" TO "book_id";--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "orderStatus" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "unit_price" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" "payment_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total_amount" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "currency" varchar(3) DEFAULT 'NGN' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "idempotency_key" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "request_hash" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_full_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address_line_1" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address_line_2" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_city" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_state" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_notes" text;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_confirmation_emails" ADD CONSTRAINT "order_confirmation_emails_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_addresses_customer_id_idx" ON "customer_addresses" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "payments_order_id_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_customer_id_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_book_unique" UNIQUE("order_id","book_id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key");--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_price_nonnegative" CHECK ("books"."price" >= 0);--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0);--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_unit_price_nonnegative" CHECK ("order_items"."unit_price" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_total_amount_nonnegative" CHECK ("orders"."total_amount" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_currency_ngn" CHECK ("orders"."currency" = 'NGN');--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_price_nonnegative" CHECK ("products"."price" >= 0);