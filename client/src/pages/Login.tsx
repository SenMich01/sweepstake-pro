import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function Login() {
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Logged in");

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="bg-slate-800 w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-2xl text-white font-bold mb-6">
            Login
          </h1>

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div>
              <Label>Email</Label>

              <Input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            <div>
              <Label>Password</Label>

              <Input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
            </div>

            <Button
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </Button>
          </form>

          <button
            className="mt-4 text-amber-400"
            onClick={() =>
              navigate("/signup")
            }
          >
            Create account
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
