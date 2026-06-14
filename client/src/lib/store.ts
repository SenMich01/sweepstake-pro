import { supabase } from "./supabase";

/* ================= TYPES ================= */

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

/* ================= POOLS ================= */

export async function getAllPools(): Promise<Pool[]> {
  const { data, error } = await supabase
    .from("pools")
    .select("*, participants(*)");

  if (error) throw error;
  return data || [];
}

export async function getPoolBySlug(slug: string): Promise<Pool | null> {
  const { data, error } = await supabase
    .from("pools")
    .select("*, participants(*)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

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

/* ================= PARTICIPANTS ================= */

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

/* ================= DRAW ================= */

export async function runDraw(poolId: string) {
  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .eq("pool_id", poolId);

  if (!participants) return;

  const shuffled = [...participants].sort(
    () => Math.random() - 0.5
  );

  for (const p of shuffled) {
    await supabase
      .from("participants")
      .update({
        points: Math.floor(Math.random() * 10),
        stage: "Group Stage",
      })
      .eq("id", p.id);
  }
}

/* ================= HELPERS ================= */

export function getMaxParticipants(plan: string) {
  if (plan === "pro") return 50;
  if (plan === "premium") return 9999;
  return 8;
}

/* ================= SHARE ENCODING ================= */

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
