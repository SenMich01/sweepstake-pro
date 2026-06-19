import { supabase } from "./supabase";

export interface Pool {
  id: string;
  slug: string;
  name: string;
  organizer_name: string;
  plan: "free" | "pro" | "premium";
  status: string;
  created_at: string;
}

export interface Participant {
  id: string;
  pool_id: string;
  name: string;
  points?: number;
  stage?: string;
}

export async function getAllPools(): Promise<Pool[]> {
  const { data, error } = await supabase
    .from("pools")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getPoolBySlug(
  slug: string
): Promise<Pool | null> {
  const { data, error } = await supabase
    .from("pools")
    .select("*")
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
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") +
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

export async function deletePool(id: string) {
  const { error } = await supabase
    .from("pools")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

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

export async function runDraw(poolId: string) {
  const { data: participants, error } =
    await supabase
      .from("participants")
      .select("*")
      .eq("pool_id", poolId);

  if (error) throw error;

  if (!participants?.length) {
    throw new Error(
      "No participants found in this pool"
    );
  }

  const shuffled = [...participants].sort(
    () => Math.random() - 0.5
  );

  for (let i = 0; i < shuffled.length; i++) {
    await supabase
      .from("participants")
      .update({
        points: Math.floor(
          Math.random() * 100
        ),
        stage:
          i < 8
            ? "Quarter Final"
            : "Group Stage",
      })
      .eq("id", shuffled[i].id);
  }

  await supabase
    .from("pools")
    .update({
      status: "active",
    })
    .eq("id", poolId);

  return true;
}

export function getMaxParticipants(
  plan: string
) {
  switch (plan) {
    case "pro":
      return 50;

    case "premium":
      return 9999;

    default:
      return 8;
  }
}

export function getMaxPools(
  plan: string
) {
  switch (plan) {
    case "premium":
      return 9999;

    case "pro":
      return 1;

    default:
      return 1;
  }
}
