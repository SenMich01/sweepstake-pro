import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  plan: mysqlEnum("plan", ["free", "pro"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Pools table
export const pools = mysqlTable("pools", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  organizerId: int("organizerId").notNull(),
  entryFee: decimal("entryFee", { precision: 10, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  maxParticipants: int("maxParticipants").default(8),
  plan: mysqlEnum("plan", ["free", "pro"]).default("free").notNull(),
  status: mysqlEnum("status", ["draft", "active", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pool = typeof pools.$inferSelect;
export type InsertPool = typeof pools.$inferInsert;

// Teams table
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  group: varchar("group", { length: 1 }),
  flagEmoji: varchar("flagEmoji", { length: 10 }),
  points: int("points").default(0),
  stage: varchar("stage", { length: 32 }).default("Group Stage"),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// Participants table
export const participants = mysqlTable("participants", {
  id: int("id").autoincrement().primaryKey(),
  poolId: int("poolId").notNull(),
  userId: int("userId"),
  name: varchar("name", { length: 128 }).notNull(),
  assignedTeamId: int("assignedTeamId"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "free"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = typeof participants.$inferInsert;

// Payments table
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  poolId: int("poolId").notNull(),
  userId: int("userId"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  paystackReference: varchar("paystackReference", { length: 128 }),
  status: mysqlEnum("status", ["pending", "success", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;