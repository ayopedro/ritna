CREATE TYPE "public"."bookType" AS ENUM('hardcover', 'softcover', 'institutional');--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"price" integer NOT NULL,
	"bookType" "bookType" DEFAULT 'hardcover' NOT NULL,
	"image" varchar(255),
	"description" varchar(1000),
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"updated_at" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"quote" text NOT NULL,
	"avatar" varchar(255) NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"updated_at" timestamp (6) with time zone
);
