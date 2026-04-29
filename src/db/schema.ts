import { is } from "drizzle-orm";
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

export const sessions = pgTable("sessions", {});

export const authorizationCodes = pgTable("authorization_codes", {});

export const clientRegistrations = pgTable("client_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
});
