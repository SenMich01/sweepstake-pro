import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

import {
  createPool,
  addParticipants,
  runDraw,
  getMaxParticipants,
  getMaxPools,
} from "@/lib/store";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function CreatePool() {
  const [, navigate] = useLocation();

  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [organizer, setOrganizer] = useState("");

  const [participants, setParticipants] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const [pool, setPool] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [userPlan, setUserPlan] = useState<
    "free" | "pro" | "premium"
  >("free");
  const [checkingAccess, setCheckingAccess] = useState(true);

  const limit = getMaxParticipants(userPlan);

  // Check the user's real plan AND their current pool count before
  // letting them get anywhere near pool creation. Free (and any plan
  // already at its pool limit) gets redirected straight to pricing.
  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      const plan =
        (profile?.plan as "free" | "pro" | "premium") || "free";
      setUserPlan(plan);

      const { count } = await supabase
        .from("pools")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const maxPools = getMaxPools(plan);

      if ((count || 0) >= maxPools) {
        toast.error(
          `Your ${plan.toUpperCase()} plan allows ${maxPools} pool(s). Upgrade to create more.`
        );
        navigate("/upgrade");
        return;
      }

      setCheckingAccess(false);
    };

    checkAccess();
  }, []);

  const handleCreate = async () => {
    if (!name || !organizer) return;

    const newPool = await createPool({
      name,
      organizerName: organizer,
      plan: userPlan,
    });

    setPool(newPool);
    setStep(2);
    toast.success("Pool created");
  };

  const add = () => {
    if (!input.trim()) {
      toast.error("Enter participant name");
      return;
    }

    if (participants.length >= limit) {
      toast.error(
        "Participant limit reached. Upgrade your plan."
      );
      navigate("/upgrade");
      return;
    }

    setParticipants([...participants, input]);
    setInput("");
  };

  const saveParticipants = async () => {
    await addParticipants(pool.id, participants);
    setStep(3);
  };

  const startDraw = async () => {
    setLoading(true);

    await runDraw(pool.id);

    setLoading(false);

    toast.success("Draw complete");

    navigate(`/pool/${pool.slug}`);
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {step === 1 && (
          <Card className="bg-slate-800">
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Pool Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Organizer"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
              />
              <Button onClick={handleCreate}>Create</Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-slate-800">
            <CardContent className="p-4 space-y-3">
              <p>
                {participants.length}/
                {limit === 9999 ? "∞" : limit}
              </p>

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button onClick={add}>Add</Button>
              </div>

              <Button onClick={saveParticipants}>
                Save Participants
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="bg-slate-800">
            <CardContent className="p-4">
              <Button onClick={startDraw} disabled={loading}>
                {loading ? "Running..." : "Run Draw"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
