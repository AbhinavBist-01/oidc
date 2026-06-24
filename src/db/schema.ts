import {
  uuid,
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { create } from "node:domain";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  isAdmin: boolean("is_admin").default(false).notNull(),
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

  verified: boolean("verified").default(false).notNull(),
  registration_id: uuid("registration_id").references(
    () => clientRegistrations.id,
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  refreshToken: varchar("refresh_token", { length: 256 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const authorizationCodes = pgTable("authorization_codes", {
  code: varchar("code", { length: 128 }).primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.clientId),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  redirectUri: text("redirect_uri").notNull(),
  scope: text("scope").notNull(),
  nonce: text("nonce"),
  codeChallenge: text("code_challenge"),
  codeChallengeMethod: varchar("code_challenge_method", { length: 10 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const clientRegistrations = pgTable("client_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  description: text("description"),
  redirectUris: json("redirect_uris").notNull(), // Array of URLs
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'approved', 'rejected'
  createdBy: uuid("created_by").references(() => usersTable.id),
  reviewedBy: uuid("reviewed_by").references(() => usersTable.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
