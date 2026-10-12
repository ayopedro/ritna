CREATE SEQUENCE "public"."order_reference_sequence" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 100001 CACHE 1;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "reference" varchar(32) DEFAULT 'RITNA-' || nextval('order_reference_sequence')::text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_reference_unique" UNIQUE("reference");