import { supabase } from "./supabase";

/* ---------------- TYPES ---------------- */

export interface Team {
  id: string;
  name: string;
  group: string;
  flagEmoji: string;
  points: number;
  stage: string;
}

export interface Participant {
  id: string;
  name: string;
  team_id?: string | null;
  team_name?: string | null;
  team_group?: string | null;
  flag_emoji?: string | null;
  points?: number;
  stage?: string | null;
}

export interface Pool {
  id: string;
  slug: string;
  name: string;
  organizer_name: string;
  plan: "free" | "pro" | "premium";
  status: "draft" | "active";
  created_at: string;
  user_id?: string | null;
}

/* ---------------- POOLS ---------------- */

export async function getAllPools(): Promise<Pool[]> {
  const { data } = await supabase.from("pools").select("*");
  return data || [];
}

export async function getPoolBySlug(slug: string): Promise<Pool | null> {
  const { data } = await supabase
    .from("pools")
    .select("*")
    .eq("slug", slug)
    .single();

  return data || null;
}

export async function createPool({
  name,
  organizerName,
  plan = "free",
}: {
  name: string;
  organizerName: string;
  plan?: "free" | "pro" | "premium";
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

export async function deletePool(slug: string) {
  await supabase.from("pools").delete().eq("slug", slug);
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
  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .eq("pool_id", poolId);

  if (!participants) return null;

  const shuffled = [...participants].sort(
    () => Math.random() - 0.5
  );

  const updated = shuffled.map((p, i) => ({
    id: p.id,
    points: Math.floor(Math.random() * 10),
    stage: i < 8 ? "Quarter" : "Group",
  }));

  for (const u of updated) {
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

/* ---------------- FIX FOR YOUR ERROR ---------------- */

export function getMaxParticipants(plan: string) {
  switch (plan) {
    case "pro":
      return 50;

    case "premium":
      return 9999;

    default:
      return 8;
  }
}

/* ---------------- OPTIONAL ENCODE/DECODE ---------------- */

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
