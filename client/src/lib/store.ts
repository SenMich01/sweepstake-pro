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
  assignedTeam: Team | null;
}

export interface Pool {
  id: string;
  slug: string;
  name: string;
  organizerName: string;
  plan: "free" | "pro" | "premium";
  status: "draft" | "active";
  createdAt: string;
  participants: Participant[];
}

/* ---------------- CREATE POOL ---------------- */

export async function createPool({
  name,
  organizerName,
  plan = "free",
}: {
  name: string;
  organizerName: string;
  plan?: "free" | "pro" | "premium";
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const slug =
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
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
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/* ---------------- GET ALL POOLS (USER ONLY) ---------------- */

export async function getAllPools(): Promise<Pool[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("pools")
    .select(
      `
      *,
      participants (*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data || []).map(mapPool);
}

/* ---------------- GET SINGLE POOL ---------------- */

export async function getPoolBySlug(
  slug: string
): Promise<Pool | null> {
  const { data, error } = await supabase
    .from("pools")
    .select(
      `
      *,
      participants (*)
    `
    )
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return mapPool(data);
}

/* ---------------- DELETE POOL ---------------- */

export async function deletePool(slug: string) {
  const { error } = await supabase
    .from("pools")
    .delete()
    .eq("slug", slug);

  if (error) throw error;
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

  const { error } = await supabase
    .from("participants")
    .insert(rows);

  if (error) throw error;
}

/* ---------------- LIMITS ---------------- */

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

/* ---------------- MAPPER ---------------- */

function mapPool(pool: any): Pool {
  return {
    id: pool.id,
    slug: pool.slug,
    name: pool.name,
    organizerName: pool.organizer_name,
    plan: pool.plan,
    status: pool.status,
    createdAt: pool.created_at,
    participants:
      pool.participants?.map((p: any) => ({
        id: p.id,
        name: p.name,
        assignedTeam: p.team_name
          ? {
              id: p.team_id,
              name: p.team_name,
              group: p.team_group,
              flagEmoji: p.flag_emoji,
              points: p.points ?? 0,
              stage: p.stage ?? "",
            }
          : null,
      })) || [],
  };
}
