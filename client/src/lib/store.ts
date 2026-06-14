import { supabase } from "./supabase";

/* ---------------- TYPES ---------------- */

export interface Pool {
  id: string;
  slug: string;
  name: string;
  organizer_name: string;
  plan: "free" | "pro" | "premium";
  status: "draft" | "active";
  created_at: string;
  participants: Participant[];
}

export interface Participant {
  id: string;
  pool_id: string;
  name: string;
  team_id: string | null;
  team_name: string | null;
  team_group: string | null;
  flag_emoji: string | null;
  points: number | null;
  stage: string | null;
}

/* ---------------- POOLS ---------------- */

export async function getAllPools() {
  const { data, error } = await supabase
    .from("pools")
    .select("*");

  if (error) throw error;
  return data;
}

export async function getPoolBySlug(slug: string) {
  const { data, error } = await supabase
    .from("pools")
    .select("*, participants(*)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

/* ---------------- CREATE POOL ---------------- */

export async function createPool({
  name,
  organizerName,
  plan = "free",
}: {
  name: string;
  organizerName: string;
  plan?: string;
}) {
  const slug =
    name.toLowerCase().replace(/\s+/g, "-") +
    "-" +
    Date.now();

  const { data, error } = await supabase
    .from("pools")
    .insert({
      slug,
      name,
      organizer_name: organizerName,
      plan,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ---------------- PARTICIPANTS ---------------- */

export async function addParticipants(
  poolId: string,
  names: string[]
) {
  const rows = names.map((name) => ({
    pool_id: poolId,
    name,
  }));

  const { data, error } = await supabase
    .from("participants")
    .insert(rows)
    .select();

  if (error) throw error;
  return data;
}

/* ---------------- DRAW ---------------- */

export async function runDraw(poolId: string) {
  // simple random assignment placeholder
  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .eq("pool_id", poolId);

  if (!participants) return null;

  const shuffled = [...participants].sort(
    () => Math.random() - 0.5
  );

  const updates = shuffled.map((p, i) => ({
    id: p.id,
    points: Math.floor(Math.random() * 10),
    stage: "Group Stage",
  }));

  for (const u of updates) {
    await supabase
      .from("participants")
      .update({
        points: u.points,
        stage: u.stage,
      })
      .eq("id", u.id);
  }

  return true;
}

/* ---------------- HELPERS ---------------- */

export function getMaxParticipants(plan: string) {
  switch (plan) {
    case "free":
      return 8;
    case "pro":
      return 50;
    case "premium":
      return 9999;
    default:
      return 8;
  }
}

/* ---------------- HASH ---------------- */

export function encodePoolToHash(pool: any) {
  return btoa(JSON.stringify(pool));
}

export function decodePoolFromHash(hash: string) {
  try {
    return JSON.parse(atob(hash));
  } catch {
    return null;
  }
}
