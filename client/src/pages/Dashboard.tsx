import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

import {
  getAllPools,
  addParticipants,
  runDraw
} from "@/lib/store";

import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function Dashboard() {
  const [, navigate] = useLocation();

  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<Pool[]>([]);

  /* ---------------- AUTH + LOAD ---------------- */

  useEffect(() => {
  const load = async () => {
    const data = await getAllPools();
    setPools(data);
  };

  load();
}, []);

  /* ---------------- DELETE ---------------- */

  const removePool = async (slug: string) => {
    if (!confirm("Delete this pool?")) return;

    try {
      await deletePool(slug);

      const refreshed = await getAllPools();
      setPools(refreshed);

      toast.success("Pool deleted");
    } catch (err) {
      toast.error("Failed to delete pool");
    }
  };

  const hasFreePlan = pools.some(
    (p) => p.plan === "free"
  );

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>
            <p className="text-slate-400">
              Manage your World Cup sweepstakes
            </p>
          </div>

          <Button
            onClick={() => navigate("/create")}
            className="bg-amber-500 hover:bg-amber-600"
          >
            Create Pool
          </Button>
        </div>

        {/* EMPTY STATE */}
        {pools.length === 0 && (
          <Card className="bg-slate-800">
            <CardContent className="p-10 text-center">
              <h2 className="text-xl font-bold mb-2">
                No pools yet
              </h2>
              <p className="text-slate-400 mb-4">
                Create your first sweepstake in seconds
              </p>
              <Button onClick={() => navigate("/create")}>
                Create Pool
              </Button>
            </CardContent>
          </Card>
        )}

        {/* POOL GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pools.map((pool) => (
            <Card
              key={pool.id}
              className="bg-slate-800 border-slate-700"
            >
              <CardContent className="p-5 space-y-4">

                <div>
                  <h3 className="font-bold text-lg">
                    {pool.name}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {pool.organizerName}
                  </p>
                </div>

                <div className="text-sm text-slate-300 space-y-1">
                  <p>
                    👥 {pool.participants.length} participants
                  </p>
                  <p>📦 Plan: {pool.plan}</p>
                  <p>
                    📅{" "}
                    {new Date(pool.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    {pool.status === "active"
                      ? "✅ Draw Complete"
                      : "📝 Draft"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() =>
                      navigate(`/pool/${pool.slug}`)
                    }
                  >
                    View
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => removePool(pool.slug)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* UPGRADE BANNER */}
        {hasFreePlan && (
          <Card className="bg-slate-800 border-amber-500">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold">
                Upgrade for more power
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Unlock PDF export, bigger groups and premium features
              </p>

              <Button
                className="mt-4 bg-amber-500 hover:bg-amber-600"
                onClick={() => navigate("/upgrade")}
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
