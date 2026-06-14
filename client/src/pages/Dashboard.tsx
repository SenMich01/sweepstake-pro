import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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

  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [organizer, setOrganizer] = useState("");

  // LOAD POOLS
  const loadPools = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("pools")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setPools(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPools();
  }, []);

  // CREATE POOL
  const createPool = async () => {
    if (!name || !organizer) {
      toast.error("Please fill all fields");
      return;
    }

    setCreating(true);

    const slug =
      name.toLowerCase().replace(/\s+/g, "-") +
      "-" +
      Date.now();

    const { data, error } = await supabase
      .from("pools")
      .insert({
        name,
        organizer_name: organizer,
        slug,
        plan: "free",
        status: "draft",
      })
      .select()
      .single();

    setCreating(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Pool created!");

    setName("");
    setOrganizer("");

    navigate(`/pool/${data.slug}`);
  };

  // DELETE POOL
  const deletePool = async (id: string) => {
    const confirmDelete = confirm("Delete this pool?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("pools")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Pool deleted");
    loadPools();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* CREATE POOL CARD */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 md:p-6 space-y-4">
            <h2 className="text-xl font-semibold">
              Create New Pool
            </h2>

            <input
              className="w-full p-3 rounded bg-slate-700"
              placeholder="Pool name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="w-full p-3 rounded bg-slate-700"
              placeholder="Organizer name"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
            />

            <Button
              onClick={createPool}
              disabled={creating}
              className="bg-amber-500 hover:bg-amber-600 w-full"
            >
              {creating ? "Creating..." : "Create Pool"}
            </Button>
          </CardContent>
        </Card>

        {/* LOADING */}
        {loading && (
          <p className="text-slate-400">Loading pools...</p>
        )}

        {/* EMPTY STATE */}
        {!loading && pools.length === 0 && (
          <Card className="bg-slate-800">
            <CardContent className="p-6 text-center text-slate-400">
              No pools yet. Create your first sweepstake above.
            </CardContent>
          </Card>
        )}

        {/* POOLS GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pools.map((pool) => (
            <Card
              key={pool.id}
              className="bg-slate-800 border-slate-700"
            >
              <CardContent className="p-4 space-y-2">

                <h3 className="font-bold text-lg">
                  {pool.name}
                </h3>

                <p className="text-sm text-slate-400">
                  Organizer: {pool.organizer_name}
                </p>

                <p className="text-sm text-slate-400">
                  Plan: {pool.plan}
                </p>

                <p className="text-sm text-slate-400">
                  Status: {pool.status}
                </p>

                <div className="flex gap-2 pt-2">
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
                    onClick={() => deletePool(pool.id)}
                  >
                    Delete
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
