import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Login() {
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Check your email for login link");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-sky-900 to-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-blue-200/20 shadow-2xl">
        <CardContent className="p-8 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">
              ⚽ Sweepstake Pro
            </h1>
            <p className="text-blue-100 text-sm">
              Sign in to manage your World Cup pools
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/90 text-black"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Sending link..." : "Login with Email"}
            </Button>
          </form>

          <p className="text-xs text-blue-100 text-center">
            You’ll receive a secure magic link to sign in
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
