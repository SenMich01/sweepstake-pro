import { supabase } from "./supabase";

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

export async function getAllPools(): Promise<Pool[]> {
  const { data, error } = await supabase
    .from("pools")
    .select(`
      *,
      participants (*)
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return (
    data?.map((pool: any) => ({
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
        })) ?? [],
    })) ?? []
  );
}

export async function getPoolBySlug(
  slug: string
): Promise<Pool | null> {
  const { data, error } = await supabase
    .from("pools")
    .select(`
      *,
      participants (*)
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    organizerName: data.organizer_name,
    plan: data.plan,
    status: data.status,
    createdAt: data.created_at,
    participants:
      data.participants?.map((p: any) => ({
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
      })) ?? [],
  };
}

export async function deletePool(
  slug: string
) {
  await supabase
    .from("pools")
    .delete()
    .eq("slug", slug);
}

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

export function getMaxParticipants(
  plan: string
) {
  if (plan === "free") return 8;
  if (plan === "pro") return 50;
  return 9999;
}
