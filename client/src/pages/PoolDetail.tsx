import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

import {
  getPoolBySlug,
  decodePoolFromHash,
  Pool,
} from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PoolDetail() {
  const { slug } = useParams();
  const [, navigate] = useLocation();

  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let found = getPoolBySlug(slug);

    if (!found && window.location.hash) {
      found = decodePoolFromHash(window.location.hash.slice(1));
    }

    setPool(found || null);
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Card>
          <CardContent className="p-8 text-center">
            <h2>Not Found</h2>
            <Button onClick={() => navigate("/create")}>
              Create Pool
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <Card className="bg-slate-800">
          <CardContent className="p-5">
            <h1 className="text-2xl font-bold">{pool.name}</h1>
            <p>{pool.organizerName}</p>
            <p>{pool.participants.length} participants</p>
          </CardContent>
        </Card>

        <Button onClick={() => {
          navigator.clipboard.writeText(
            `${window.location.origin}/pool/${pool.slug}`
          );
          toast.success("Copied");
        }}>
          Copy Link
        </Button>

      </div>
    </div>
  );
}
