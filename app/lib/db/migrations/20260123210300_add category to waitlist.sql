CREATE TYPE "public"."category" AS ENUM('civilian', 'military');--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "category" "category" DEFAULT 'civilian' NOT NULL;