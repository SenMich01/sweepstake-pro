import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

import {
  getMaxPools,
  getMaxParticipants,
} from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Pool = {
  id: string;
  slug: string;
  name: string;
  organizer_name: string;
  plan: string;
  status: string;
  created_at: string;
};

export default function Dashboard() {
  const [, navigate] = useLocation();

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [pools, setPools] = useState<Pool[]>([]);

  const [name, setName] = useState("");
  const [organizer, setOrganizer] = useState("");

  const [userPlan, setUserPlan] =
    useState<"free" | "pro" | "premium">("free");
  const loadUserPlan = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  setUserPlan(data?.plan || "free");
};

  const loadPools = async () => {
  try {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("pools")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    setPools(data || []);
  } catch (err: any) {
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  const init = async () => {
    await loadUserPlan();
    await loadPools();
  };

  init();
}, []);


  const loadUserPlan = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    navigate("/login");
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  setUserPlan(
    (data?.plan as
      | "free"
      | "pro"
      | "premium") || "free"
  );
};
  
  const handleCreatePool = async () => {
    const maxPools = getMaxPools(userPlan);

    if (pools.length >= maxPools) {
      toast.error(
        `Your ${userPlan.toUpperCase()} plan allows ${maxPools} pool(s)`
      );

      navigate("/upgrade");
      return;
    }

    if (!name.trim()) {
      toast.error("Enter pool name");
      return;
    }

    if (!organizer.trim()) {
      toast.error("Enter organizer name");
      return;
    }

    try {
      setCreating(true);

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
          organizer_name: organizer,
          plan: userPlan,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Pool created");

      setName("");
      setOrganizer("");

      await loadPools();

      navigate(`/pool/${data.slug}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreatePool = async () => {
  const maxPools = getMaxPools(userPlan);

  if (pools.length >= maxPools) {
    toast.error(
      `Your ${userPlan.toUpperCase()} plan allows ${maxPools} pool(s)`
    );

    navigate("/upgrade");
    return;
  }

  if (!name.trim()) {
    toast.error("Enter pool name");
    return;
  }

  if (!organizer.trim()) {
    toast.error("Enter organizer name");
    return;
  }

  try {
    setCreating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login");
      navigate("/login");
      return;
    }

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
        user_id: user.id,
        slug,
        name,
        organizer_name: organizer,
        plan: userPlan,
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;

    toast.success("Pool created");

    setName("");
    setOrganizer("");

    await loadPools();

    navigate(`/pool/${data.slug}`);
  } catch (err: any) {
    toast.error(err.message);
  } finally {
    setCreating(false);
  }
};
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        <div>
          <h1 className="text-4xl font-bold">
            Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Create and manage your sweepstakes
          </p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">

            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-xl">
                  Current Plan
                </h2>

                <p className="text-slate-400">
                  {userPlan.toUpperCase()}
                </p>
              </div>

              <Button
                onClick={() => navigate("/upgrade")}
              >
                Upgrade
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">

              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-slate-400">
                  Pools Used
                </div>

                <div className="text-2xl font-bold">
                  {pools.length}/
                  {getMaxPools(userPlan) === 9999
                    ? "∞"
                    : getMaxPools(userPlan)}
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-slate-400">
                  Participant Limit
                </div>

                <div className="text-2xl font-bold">
                  {getMaxParticipants(userPlan) === 9999
                    ? "Unlimited"
                    : getMaxParticipants(userPlan)}
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-slate-400">
                  Plan
                </div>

                <div className="text-2xl font-bold">
                  {userPlan.toUpperCase()}
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 space-y-4">

            <h2 className="text-xl font-bold">
              Create New Pool
            </h2>

            <input
              className="w-full rounded-lg bg-slate-700 p-3"
              placeholder="Pool Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <input
              className="w-full rounded-lg bg-slate-700 p-3"
              placeholder="Organizer Name"
              value={organizer}
              onChange={(e) =>
                setOrganizer(e.target.value)
              }
            />

            <Button
              className="w-full"
              disabled={creating}
              onClick={handleCreatePool}
            >
              {creating
                ? "Creating..."
                : "Create Pool"}
            </Button>

          </CardContent>
        </Card>

        {!loading && (
          <>
            <h2 className="text-2xl font-bold">
              My Pools
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

              {pools.map((pool) => (
                <Card
                  key={pool.id}
                  className="bg-slate-800 border-slate-700"
                >
                  <CardContent className="p-5 space-y-3">

                    <h3 className="text-xl font-bold">
                      {pool.name}
                    </h3>

                    <p className="text-slate-400">
                      Organizer: {pool.organizer_name}
                    </p>

                    <p className="text-slate-400">
                      Plan: {pool.plan}
                    </p>

                    <p className="text-slate-400">
                      Status: {pool.status}
                    </p>

                    <div className="flex gap-2">

                      <Button
                        className="flex-1"
                        onClick={() =>
                          navigate(
                            `/pool/${pool.slug}`
                          )
                        }
                      >
                        Open
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleDeletePool(
                            pool.id,
                            pool.name
                          )
                        }
                      >
                        Delete
                      </Button>

                    </div>

                  </CardContent>
                </Card>
              ))}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
