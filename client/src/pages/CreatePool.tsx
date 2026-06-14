import { useState } from "react";
import { useLocation } from "wouter";
import { Trophy, Upload, Users, PlayCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createPool,
  addParticipants,
  runDraw,
  getMaxParticipants,
} from "@/lib/store";

export default function CreatePool() {
  const [, navigate] = useLocation();

  const [step, setStep] = useState(1);

  const [poolName, setPoolName] = useState("");
  const [organizerName, setOrganizerName] = useState("");

  const [poolSlug, setPoolSlug] = useState("");
  const [plan] = useState<"free" | "pro" | "premium">("free");

  const [participantInput, setParticipantInput] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);

  const [drawing, setDrawing] = useState(false);

  const limit = getMaxParticipants(plan);

  const handleCreatePool = () => {
    if (!poolName.trim() || !organizerName.trim()) {
      toast.error("Please complete all fields");
      return;
    }

    const pool = createPool({
      name: poolName,
      organizerName,
      plan,
    });

    setPoolSlug(pool.slug);
    setStep(2);

    toast.success("Pool created");
  };

  const addParticipant = () => {
    const value = participantInput.trim();

    if (!value) return;

    if (participants.includes(value)) {
      toast.error("Participant already added");
      return;
    }

    if (participants.length >= limit) {
      toast.error(`Free plan supports ${limit} participants`);
      return;
    }

    setParticipants([...participants, value]);
    setParticipantInput("");
  };

  const handleCSVUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result);

      const names = text
        .split(/[\n,]/)
        .map((n) => n.trim())
        .filter(Boolean);

      const merged = [...new Set([...participants, ...names])].slice(
        0,
        limit
      );

      setParticipants(merged);

      toast.success(`${names.length} names imported`);
    };

    reader.readAsText(file);
  };

  const saveParticipants = () => {
    if (!participants.length) {
      toast.error("Add at least one participant");
      return;
    }

    addParticipants(poolSlug, participants);

    setStep(3);

    toast.success("Participants added");
  };

  const handleDraw = async () => {
    try {
      setDrawing(true);

      await new Promise((r) => setTimeout(r, 1500));

      runDraw(poolSlug);

      toast.success("Draw completed");
    } catch {
      toast.error("Unable to run draw");
    } finally {
      setDrawing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Create Sweepstake Pool
          </h1>

          <div className="mt-6 h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all"
              style={{
                width: `${(step / 3) * 100}%`,
              }}
            />
          </div>

          <div className="flex justify-between mt-2 text-sm text-slate-400">
            <span>Pool</span>
            <span>Participants</span>
            <span>Draw</span>
          </div>
        </div>

        {step === 1 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Step 1 — Pool Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label>Pool Name</Label>
                <Input
                  value={poolName}
                  onChange={(e) =>
                    setPoolName(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Organizer Name</Label>
                <Input
                  value={organizerName}
                  onChange={(e) =>
                    setOrganizerName(e.target.value)
                  }
                />
              </div>

              <Button
                className="w-full bg-amber-400 text-black"
                onClick={handleCreatePool}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>
                Step 2 — Add Participants
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex gap-2">
                <Input
                  placeholder="Participant name"
                  value={participantInput}
                  onChange={(e) =>
                    setParticipantInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addParticipant();
                    }
                  }}
                />

                <Button onClick={addParticipant}>
                  Add
                </Button>
              </div>

              <div>
                <Label>Upload CSV</Label>

                <Input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCSVUpload}
                />
              </div>

              <div className="text-sm text-slate-400">
                {participants.length}/{limit} participants
              </div>

              {plan === "free" && (
                <div className="bg-slate-900 p-4 rounded-lg border border-amber-500">
                  <p className="text-sm">
                    Free plan allows only 8 participants.
                  </p>

                  <Button
                    variant="link"
                    onClick={() =>
                      navigate("/upgrade")
                    }
                  >
                    Upgrade Plan
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {participants.map((p) => (
                  <div
                    key={p}
                    className="bg-slate-900 rounded p-2"
                  >
                    {p}
                  </div>
                ))}
              </div>

              <Button
                onClick={saveParticipants}
                className="w-full"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>
                Step 3 — Run the Draw
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                disabled={drawing}
                className="w-full bg-amber-400 text-black"
                onClick={handleDraw}
              >
                {drawing ? (
                  <>⚽ Running Draw...</>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Run The Draw
                  </>
                )}
              </Button>

              {!drawing && (
                <div className="grid md:grid-cols-2 gap-3">
                  <Button
                    onClick={() =>
                      navigate(`/pool/${poolSlug}`)
                    }
                  >
                    View Pool
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate("/dashboard")
                    }
                  >
                    Go To Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
