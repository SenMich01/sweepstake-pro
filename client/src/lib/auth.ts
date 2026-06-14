import { supabase } from "./supabase";

export async function signInWithEmail(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/home`,
    },
  });

  if (error) throw error;

  return data;
}
