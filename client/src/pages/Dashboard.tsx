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

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [pools, setPools] = useState<Pool[]>([]);

  const [name, setName] = useState("");
  const [organizer, setOrganizer] = useState("");

  const loadPools = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("pools")
        .select("*")
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
    loadPools();
  }, []);

  const handleCreatePool = async () => {
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
          plan: "free",
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

  const handleDeletePool = async (
    id: string,
    poolName: string
  ) => {
    const confirmed = window.confirm(
      `Delete "${poolName}"?`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("pools")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPools((prev) =>
        prev.filter((pool) => pool.id !== id)
      );

      toast.success("Pool deleted");
    } catch (err: any) {
      toast.error(
        err.message || "Delete failed"
      );
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

        {loading && (
          <Card className="bg-slate-800">
            <CardContent className="p-6">
              Loading pools...
            </CardContent>
          </Card>
        )}

        {!loading &&
          pools.length === 0 && (
            <Card className="bg-slate-800">
              <CardContent className="p-6 text-center">
                No pools created yet.
              </CardContent>
            </Card>
          )}

        {!loading &&
          pools.length > 0 && (
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
                        Organizer:{" "}
                        {pool.organizer_name}
                      </p>

                      <p className="text-slate-400">
                        Plan: {pool.plan}
                      </p>

                      <p className="text-slate-400">
                        Status: {pool.status}
                      </p>

                      <div className="flex gap-2 pt-3">

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
