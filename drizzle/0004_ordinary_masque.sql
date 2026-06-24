ALTER TABLE "authorization_codes" ADD COLUMN "code_challenge" text;--> statement-breakpoint
ALTER TABLE "authorization_codes" ADD COLUMN "code_challenge_method" varchar(10);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "refresh_token" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_refresh_token_unique" UNIQUE("refresh_token");