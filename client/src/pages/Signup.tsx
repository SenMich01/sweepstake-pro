import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function Signup() {
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must be at least 6 characters"
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      "Account created. Please verify your email."
    );

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8">

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚽</div>

          <h1 className="text-3xl font-bold text-white">
            Create Account
          </h1>

          <p className="text-slate-400 mt-2">
            Join the World Cup Sweepstake
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-slate-700 text-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-slate-700 text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl p-3 font-semibold text-white"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-400"
          >
            Already have an account?
          </button>
        </div>
      </div>
    </div>
  );
}
