import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

import {
  getPoolBySlug,
  Pool,
} from "@/lib/store";

import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PoolDetail() {
  const { slug } = useParams();
  const [, navigate] = useLocation();

  const [pool, setPool] = useState<Pool | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPool = async () => {
      try {
        if (!slug) {
          setLoading(false);
          return;
        }

        const found = await getPoolBySlug(slug);

        if (!found) {
          setLoading(false);
          return;
        }

        setPool(found);

        const { data, error } = await supabase
          .from("participants")
          .select("*")
          .eq("pool_id", found.id);

        if (error) {
          console.error(error);
        }

        setParticipants(data || []);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    loadPool();
  }, [slug]);

  const copyLink = async () => {
    if (!pool) return;

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/pool/${pool.slug}`
      );

      toast.success("Pool link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading pool...
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-xl font-bold">
              Pool Not Found
            </h2>

            <Button
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 space-y-2">

            <h1 className="text-3xl font-bold">
              {pool.name}
            </h1>

            <p className="text-slate-400">
              Organizer: {pool.organizer_name}
            </p>

            <p className="text-slate-400">
              Plan: {pool.plan}
            </p>

            <p className="text-slate-400">
              Status: {pool.status}
            </p>

            <p className="text-slate-400">
              Participants: {participants.length}
            </p>

          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">

            <h2 className="text-xl font-bold mb-4">
              Participants
            </h2>

            {participants.length === 0 ? (
              <p className="text-slate-400">
                No participants yet.
              </p>
            ) : (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex justify-between bg-slate-700 rounded-lg p-3"
                  >
                    <span>{participant.name}</span>

                    <span>
                      {participant.points || 0} pts
                    </span>
                  </div>
                ))}
              </div>
            )}

          </CardContent>
        </Card>

        <div className="flex gap-3">

          <Button onClick={copyLink}>
            Copy Pool Link
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>

        </div>

      </div>
    </div>
  );
}
