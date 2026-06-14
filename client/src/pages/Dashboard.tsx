import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

import {
  getAllPools,
  deletePool,
  Pool,
} from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [, navigate] = useLocation();

  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllPools();
        setPools(data);
      } catch (err) {
        toast.error("Failed to load pools");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const removePool = async (slug: string) => {
    if (!confirm("Delete this pool?")) return;

    await deletePool(slug);

    const updated = await getAllPools();
    setPools(updated);

    toast.success("Pool deleted");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">Dashboard</h1>

        {pools.length === 0 && (
          <Card className="bg-slate-800">
            <CardContent className="p-10 text-center">
              <h2>No Pools Yet</h2>

              <Button onClick={() => navigate("/create")}>
                Create Pool
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pools.map((pool) => (
            <Card key={pool.id} className="bg-slate-800">
              <CardContent className="p-5 space-y-2">

                <h3 className="font-bold">{pool.name}</h3>
                <p>{pool.organizer_name}</p>

                <p>{pool.participants?.length || 0} participants</p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/pool/${pool.slug}`)}
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

      </div>
    </div>
  );
}
