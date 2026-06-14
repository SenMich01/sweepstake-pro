import { supabase } from "./supabase";

export async function createPool({
  name,
  organizerName,
  plan = "free",
}) {
  const slug =
    name.toLowerCase().replace(/\s+/g, "-") +
    "-" +
    Date.now();

  const { data, error } =
    await supabase
      .from("pools")
      .insert({
        slug,
        name,
        organizer_name: organizerName,
        plan,
      })
      .select()
      .single();

  if (error) throw error;

  return data;
}
