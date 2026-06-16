import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
// At the top of CreatePool.tsx, add this import:
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
  const [organizer, setOrganizer] = useState("");

  const [participants, setParticipants] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const [pool, setPool] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const limit = getMaxParticipants("free");

  const handleCreate = async () => {
    if (!name || !organizer) return;

    const newPool = await createPool({
      name,
      organizerName: organizer,
    });

    setPool(newPool);
    setStep(2);
    toast.success("Pool created");
  };

  const add = () => {
    if (!input) return;
    if (participants.length >= limit) return;

    setParticipants([...participants, input]);
    setInput("");
  };

  const saveParticipants = async () => {
    await addParticipants(pool.id, participants);
    setStep(3);
  };

  const startDraw = async () => {
    setLoading(true);

    await runDraw(pool.id);

    setLoading(false);

    toast.success("Draw complete");

    navigate(`/pool/${pool.slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {step === 1 && (
          <Card className="bg-slate-800">
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Pool Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Organizer"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
              />
              <Button onClick={handleCreate}>Create</Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-slate-800">
            <CardContent className="p-4 space-y-3">
              <p>
                {participants.length}/{limit}
              </p>

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button onClick={add}>Add</Button>
              </div>

              <Button onClick={saveParticipants}>
                Save Participants
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="bg-slate-800">
            <CardContent className="p-4">
              <Button onClick={startDraw} disabled={loading}>
                {loading ? "Running..." : "Run Draw"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
