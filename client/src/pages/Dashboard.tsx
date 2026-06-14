import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

import {
  getAllPools,
  deletePool,
  Pool,
} from "@/lib/store";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function Dashboard() {
  const [, navigate] = useLocation();

  const [pools, setPools] = useState<Pool[]>([]);

  useEffect(() => {
    setPools(getAllPools());
  }, []);

  const removePool = (slug: string) => {
    if (!confirm("Delete this pool?")) return;

    deletePool(slug);

    setPools(getAllPools());

    toast.success("Pool deleted");
  };

  const hasFreePool = pools.some(
    (p) => p.plan === "free"
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        {pools.length === 0 && (
          <Card className="bg-slate-800">
            <CardContent className="p-10 text-center">
              <h2 className="text-xl mb-4">
                No Pools Yet
              </h2>

              <Button
                onClick={() =>
                  navigate("/create")
                }
              >
                Create First Pool
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pools.map((pool) => (
            <Card
              key={pool.id}
              className="bg-slate-800"
            >
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold">
                  {pool.name}
                </h3>

                <p>{pool.organizerName}</p>

                <p>
                  {pool.participants.length} participants
                </p>

                <p className="capitalize">
                  {pool.plan}
                </p>

                <p>
                  {new Date(
                    pool.createdAt
                  ).toLocaleDateString()}
                </p>

                <p>
                  {pool.status === "active"
                    ? "Draw complete"
                    : "Draft"}
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      navigate(
                        `/pool/${pool.slug}`
                      )
                    }
                  >
                    View
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() =>
                      removePool(pool.slug)
                    }
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {hasFreePool && (
          <Card className="bg-slate-800 border-amber-400">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold">
                Upgrade Your Pool
              </h3>

              <p className="text-slate-400">
                Unlock more participants,
                PDF exports and premium tools.
              </p>

              <Button
                className="mt-4"
                onClick={() =>
                  navigate("/upgrade")
                }
              >
                Upgrade
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
