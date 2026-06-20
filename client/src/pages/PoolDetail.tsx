import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

import {
  getPoolBySlug,
  getMaxParticipants,
  runDraw,
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
  const [participantName, setParticipantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);

  const loadPool = async () => {
    if (!slug) return;

    const found = await getPoolBySlug(slug);

    if (!found) {
      setLoading(false);
      return;
    }

    setPool(found);

    const { data } = await supabase
      .from("participants")
      .select("*")
      .eq("pool_id", found.id)
      .order("created_at", {
        ascending: true,
      });

    setParticipants(data || []);

    setLoading(false);
  };

  useEffect(() => {
    loadPool();
  }, [slug]);

  const addParticipant = async () => {
    if (!pool) return;

    if (!participantName.trim()) {
      toast.error("Enter participant name");
      return;
    }

    const limit = getMaxParticipants(pool.plan);

    if (participants.length >= limit) {
      toast.error(
        "Participant limit reached. Upgrade your plan."
      );

      navigate("/upgrade");

      return;
    }

    const { error } = await supabase
      .from("participants")
      .insert({
        pool_id: pool.id,
        name: participantName,
      });

    if (error) {
      toast.error(error.message);
      return;
    }

    setParticipantName("");

    await loadPool();

    toast.success("Participant added");
  };

  const handleRunDraw = async () => {
    if (!pool) return;

    if (participants.length === 0) {
      toast.error("Add participants before running the draw");
      return;
    }

    try {
      setDrawing(true);
      await runDraw(pool.id);
      toast.success("Draw complete");
      await loadPool();
    } catch (err: any) {
      toast.error(err.message || "Failed to run draw");
    } finally {
      setDrawing(false);
    }
  };

  const copyLink = async () => {
    if (!pool) return;

    await navigator.clipboard.writeText(
      `${window.location.origin}/pool/${pool.slug}`
    );

    toast.success("Link copied");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Pool not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <Card className="bg-slate-800">
          <CardContent className="p-6">

            <h1 className="text-3xl font-bold">
              {pool.name}
            </h1>

            <p>
              Organizer: {pool.organizer_name}
            </p>

            <p>
              Plan: {pool.plan}
            </p>

            <p>
              Status: {pool.status}
            </p>

            <p>
              Participants:
              {" "}
              {participants.length}
              /
              {getMaxParticipants(pool.plan)}
            </p>

          </CardContent>
        </Card>

        <Card className="bg-slate-800">
          <CardContent className="p-6">

            <h2 className="text-xl font-bold mb-4">
              Add Participant
            </h2>

            <div className="flex gap-2">

              <input
                value={participantName}
                onChange={(e) =>
                  setParticipantName(e.target.value)
                }
                placeholder="Participant name"
                className="flex-1 p-3 rounded bg-slate-700"
              />

              <Button onClick={addParticipant}>
                Add
              </Button>

            </div>

          </CardContent>
        </Card>

        <Card className="bg-slate-800">
          <CardContent className="p-6">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Participants
              </h2>

              {pool.status !== "active" && (
                <Button
                  onClick={handleRunDraw}
                  disabled={drawing || participants.length === 0}
                >
                  {drawing ? "Running Draw..." : "Run Draw"}
                </Button>
              )}
            </div>

            {participants.length === 0 ? (
              <p>No participants yet.</p>
            ) : (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-slate-700 p-3 rounded flex justify-between items-center"
                  >
                    <span>{participant.name}</span>

                    {pool.status === "active" && (
                      <span className="text-sm text-slate-300">
                        {participant.stage || "—"}
                        {typeof participant.points === "number" && (
                          <> &middot; {participant.points} pts</>
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

          </CardContent>
        </Card>

        <div className="flex gap-3">

          <Button onClick={copyLink}>
            Copy Link
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </Button>

        </div>

      </div>
    </div>
  );
}
