import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

import { getAllPools, deletePool, Pool } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [, navigate] = useLocation();

  const [pools, setPools] = useState<Pool[]>([]);

  useEffect(() => {
    setPools(getAllPools());
  }, []);

  const remove = (slug: string) => {
    if (!confirm("Delete?")) return;

    deletePool(slug);
    setPools(getAllPools());

    toast.success("Deleted");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">Dashboard</h1>

        {pools.length === 0 && (
          <Card className="bg-slate-800">
            <CardContent className="p-10 text-center">
              <Button onClick={() => navigate("/create")}>
                Create Pool
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pools.map((p) => (
            <Card key={p.id} className="bg-slate-800">
              <CardContent className="p-5 space-y-2">

                <h3 className="font-bold">{p.name}</h3>
                <p>{p.organizerName}</p>
                <p>{p.participants.length} participants</p>

                <div className="flex gap-2">
                  <Button onClick={() => navigate(`/pool/${p.slug}`)}>
                    View
                  </Button>

                  <Button variant="destructive" onClick={() => remove(p.slug)}>
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
