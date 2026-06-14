import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

import {
  createPool,
  addParticipants,
  runDraw,
  getMaxParticipants,
} from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function CreatePool() {
  const [, navigate] = useLocation();

  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [organizerName, setOrganizerName] = useState("");

  const [participants, setParticipants] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const [pool, setPool] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const limit = getMaxParticipants("free");

  // STEP 1: Create pool
  const handleCreatePool = async () => {
    if (!name || !organizerName) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const newPool = await createPool({
        name,
        organizerName,
        plan: "free",
      });

      setPool(newPool);
      setStep(2);
      toast.success("Pool created!");
    } catch (err) {
      toast.error("Failed to create pool");
    }
  };

  // Add participant
  const addParticipant = () => {
    if (!input.trim()) return;

    if (participants.length >= limit) {
      toast.error(`Free plan limit is ${limit}`);
      return;
    }

    setParticipants([...participants, input.trim()]);
    setInput("");
  };

  // STEP 2: Save participants
  const handleSaveParticipants = async () => {
    if (!pool) return;

    try {
      await addParticipants(pool.id, participants);
      setStep(3);
      toast.success("Participants added");
    } catch {
      toast.error("Failed to add participants");
    }
  };

  // STEP 3: Run draw
  const handleRunDraw = async () => {
    if (!pool) return;

    setLoading(true);

    try {
      await runDraw(pool.id);
      toast.success("Draw completed!");

      navigate(`/pool/${pool.slug}`);
    } catch {
      toast.error("Draw failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* STEP INDICATOR */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded ${
                step >= s ? "bg-amber-400" : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <Card className="bg-slate-800">
            <CardContent className="p-6 space-y-4">
              <Input
                placeholder="Pool Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                placeholder="Organizer Name"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
              />

              <Button onClick={handleCreatePool}>
                Create Pool
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <Card className="bg-slate-800">
            <CardContent className="p-6 space-y-4">

              <p>
                Participants: {participants.length} / {limit}
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="Enter participant name"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && addParticipant()
                  }
                />
                <Button onClick={addParticipant}>
                  Add
                </Button>
              </div>

              <ul className="space-y-1">
                {participants.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>

              <Button onClick={handleSaveParticipants}>
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Card className="bg-slate-800">
            <CardContent className="p-6 text-center space-y-4">

              <h2 className="text-xl">
                Ready to run the draw?
              </h2>

              <Button
                onClick={handleRunDraw}
                disabled={loading}
              >
                {loading ? "Running Draw..." : "Run Draw"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
