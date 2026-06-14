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

  const signIn = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <Card className="bg-slate-800 w-full max-w-md">
        <CardContent className="p-6 space-y-4">

          <h1 className="text-2xl font-bold">Login</h1>

          <Input
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            onClick={signIn}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Sending link..." : "Send Magic Link"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
