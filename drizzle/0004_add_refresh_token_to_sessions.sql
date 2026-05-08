ALTER TABLE "sessions" ADD COLUMN "refresh_token" varchar(256);

UPDATE "sessions"
SET "refresh_token" = encode(gen_random_bytes(32), 'hex')
WHERE "refresh_token" IS NULL;

ALTER TABLE "sessions" ALTER COLUMN "refresh_token" SET NOT NULL;

ALTER TABLE "sessions"
ADD CONSTRAINT "sessions_refresh_token_unique" UNIQUE ("refresh_token");
