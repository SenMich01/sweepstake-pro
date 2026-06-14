import { supabase } from "./supabase";

/* ================= TYPES ================= */

export type Team = {
  id: string;
  name: string;
  group: string;
  flag_emoji: string;
  points: number;
  stage: string;
};

export type Participant = {
  id: string;
  name: string;
  pool_id: string;
  team_id: string | null;
  team_name: string | null;
  team_group: string | null;
  flag_emoji: string | null;
  points: number | null;
  stage: string | null;
};

export type Pool = {
  id: string;
  slug: string;
  name: string;
  organizer_name: string;
  plan: "free" | "pro" | "premium";
  status: "draft" | "active";
  created_at: string;
  user_id: string | null;
  participants: Participant[];
};

/* ================= POOLS ================= */

export async function getAllPools(): Promise<Pool[]> {
  const { data, error } = await supabase
    .from("pools")
    .select("*, participants(*)")
    .order("created_at", { ascending: false });

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
  const { error } = await supabase
    .from("pools")
    .delete()
    .eq("slug", slug);

  if (error) throw error;
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

  const { error } = await supabase
    .from("participants")
    .insert(rows);

  if (error) throw error;
}

/* ================= DRAW ================= */

export async function runDraw(poolId: string) {
  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .eq("pool_id", poolId);

  if (!participants) return;

  const { data: teams } = await supabase
    .from("teams")
    .select("*");

  if (!teams) return;

  const shuffled = [...teams].sort(
    () => Math.random() - 0.5
  );

  const updates = participants.map((p, i) => {
    const team = shuffled[i % shuffled.length];

    return {
      id: p.id,
      team_id: team.id,
      team_name: team.name,
      team_group: team.group,
      flag_emoji: team.flag_emoji,
      points: team.points,
      stage: team.stage,
    };
  });

  for (const u of updates) {
    await supabase
      .from("participants")
      .update(u)
      .eq("id", u.id);
  }
}

/* ================= UTILS ================= */

export function encodePoolToHash(pool: Pool) {
  return btoa(JSON.stringify(pool));
}

export function decodePoolFromHash(hash: string): Pool | null {
  try {
    return JSON.parse(atob(hash));
  } catch {
    return null;
  }
}
