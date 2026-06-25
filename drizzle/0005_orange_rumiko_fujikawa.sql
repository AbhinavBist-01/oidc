ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(250);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "scope" text DEFAULT 'openid' NOT NULL;