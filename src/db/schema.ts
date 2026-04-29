import {
  uuid,
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  firstName: varchar("first_name", { length: 25 }),
  lastName: varchar("last_name", { length: 25 }),

  profileImageURL: text("profile_image_url"),

  email: varchar("email", { length: 322 }).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),

  password: varchar("password", { length: 66 }),
  salt: text("salt"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const clients = pgTable("clients", {
  clientId: uuid("client_id").primaryKey().defaultRandom(),
  clientName: varchar("client_name", { length: 50 }).notNull(),
  clientSecret: varchar("client_secret", { length: 66 }).notNull(),
  redirectUri: json("redirect_uri").notNull(),
  grantTypes: json("grant_types").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  scope: text("scope").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const shortCodes = pgTable("short_codes", {
  code: varchar("code", { length: 10 }).primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.clientId),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  scope: text("scope").notNull(),
  nonce: text("nonce"),
  codeChallenge: text("code_challenge").notNull(),
  codeChallengeMethod: varchar("code_challenge_method", {
    length: 10,
  }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
