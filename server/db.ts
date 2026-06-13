import { eq, and, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, pools, participants, teams, payments } from "../drizzle/schema";
import { ENV } from "./_core/env";
import type { Pool, Participant, Team, Payment } from "../shared/types";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Pool queries
export async function createPool(data: {
  name: string;
  slug: string;
  organizerId: number;
  entryFee: string;
  currency: string;
  maxParticipants: number;
  plan: "free" | "pro";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(pools).values(data);
  // Fetch and return the created pool
  const created = await db.select().from(pools).where(eq(pools.slug, data.slug)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getPoolBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(pools).where(eq(pools.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPoolById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(pools).where(eq(pools.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserPools(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(pools)
    .where(eq(pools.organizerId, userId))
    .orderBy(desc(pools.createdAt));

  return result;
}

export async function updatePoolStatus(poolId: number, status: "draft" | "active" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(pools).set({ status }).where(eq(pools.id, poolId));
}

export async function updatePoolPlan(poolId: number, plan: "free" | "pro") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(pools).set({ plan }).where(eq(pools.id, poolId));
}

// Participant queries
export async function addParticipant(data: {
  poolId: number;
  userId?: number;
  name: string;
  paymentStatus: "pending" | "paid" | "free";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(participants).values(data);
  return result;
}

export async function getPoolParticipants(poolId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(participants).where(eq(participants.poolId, poolId));
  return result;
}

export async function assignTeamToParticipant(participantId: number, teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(participants).set({ assignedTeamId: teamId }).where(eq(participants.id, participantId));
}

export async function updateParticipantPaymentStatus(
  participantId: number,
  status: "pending" | "paid" | "free"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(participants).set({ paymentStatus: status }).where(eq(participants.id, participantId));
}

export async function getParticipantCount(poolId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select().from(participants).where(eq(participants.poolId, poolId));
  return result.length;
}

// Team queries
export async function getAllTeams(): Promise<Team[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(teams).orderBy(asc(teams.group), asc(teams.name));
  return result;
}

export async function getTeamById(id: number): Promise<Team | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTeamsByIds(ids: number[]): Promise<Team[]> {
  const db = await getDb();
  if (!db) return [];

  if (ids.length === 0) return [];

  const result = await db.select().from(teams).where(eq(teams.id, ids[0]));
  return result;
}

export async function updateTeamPoints(teamId: number, points: number, stage: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(teams).set({ points, stage }).where(eq(teams.id, teamId));
}

// Payment queries
export async function createPayment(data: {
  poolId: number;
  userId?: number;
  amount: string;
  paystackReference?: string;
  status: "pending" | "success" | "failed";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(data);
  return result;
}

export async function getPaymentByReference(reference: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(payments).where(eq(payments.paystackReference, reference)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentStatus(paymentId: number, status: "pending" | "success" | "failed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(payments).set({ status }).where(eq(payments.id, paymentId));
}

export async function getPoolPayments(poolId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(payments).where(eq(payments.poolId, poolId));
  return result;
}
