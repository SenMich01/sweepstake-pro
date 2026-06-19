import { supabase } from "./supabase";

export async function createProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email,
      plan: "free",
    });

  if (error) {
    console.error(error);
  }
}
