import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowRight, ArrowLeft, Users, Zap } from "lucide-react";
import { toast } from "sonner";

type Step = "details" | "participants" | "draw";

export default function CreatePool() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("details");

  // Form state
  const [poolName, setPoolName] = useState("");
  const [entryFee, setEntryFee] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [maxParticipants, setMaxParticipants] = useState("8");

  const [participants, setParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState("");

  const [poolSlug, setPoolSlug] = useState("");
  const [poolId, setPoolId] = useState<number | null>(null);

  // API calls
  const createPoolMutation = trpc.pools.create.useMutation();
  const addParticipantMutation = trpc.participants.add.useMutation();
  const executDrawMutation = trpc.draw.execute.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-300 mb-6">Please sign in to create a pool.</p>
          <Button onClick={() => setLocation("/")} className="bg-amber-500 hover:bg-amber-600 text-white">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleCreatePool = async () => {
    if (!poolName.trim()) {
      toast.error("Please enter a pool name");
      return;
    }

    try {
      const result = await createPoolMutation.mutateAsync({
        name: poolName,
        entryFee,
        currency,
        maxParticipants: parseInt(maxParticipants),
      });

      setPoolSlug(result.slug);
      setPoolId(result.poolId);
      setStep("participants");
      toast.success("Pool created! Now add participants.");
    } catch (error) {
      toast.error("Failed to create pool");
      console.error(error);
    }
  };

  const handleAddParticipant = () => {
    if (!participantInput.trim()) {
      toast.error("Please enter a participant name");
      return;
    }

    if (participants.length >= parseInt(maxParticipants)) {
      toast.error(`Pool is full (max ${maxParticipants} participants)`);
      return;
    }

    setParticipants([...participants, participantInput]);
    setParticipantInput("");
    toast.success("Participant added");
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleAddParticipants = async () => {
    if (participants.length === 0) {
      toast.error("Please add at least one participant");
      return;
    }

    try {
      if (!poolId) {
        toast.error("Pool ID not found");
        return;
      }

      for (const name of participants) {
        await addParticipantMutation.mutateAsync({
          poolId,
          name,
          paymentStatus: "free",
        });
      }

      setStep("draw");
      toast.success("Participants added! Ready to draw teams.");
    } catch (error) {
      toast.error("Failed to add participants");
      console.error(error);
    }
  };

  const handleExecuteDraw = async () => {
    if (!poolId) {
      toast.error("Pool ID not found");
      return;
    }

    try {
      await executDrawMutation.mutateAsync({
        poolId,
      });

      toast.success("Teams drawn! Redirecting to pool...");
      setTimeout(() => {
        setLocation(`/pool/${poolSlug}`);
      }, 1000);
    } catch (error) {
      toast.error("Failed to execute draw");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Sweepstake Pro</span>
          </div>
          <Button
            onClick={() => setLocation("/dashboard")}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="flex justify-between mb-12">
          {["details", "participants", "draw"].map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === s
                    ? "bg-amber-500 text-white"
                    : ["details", "participants", "draw"].indexOf(step) > idx
                      ? "bg-green-500 text-white"
                      : "bg-slate-700 text-slate-400"
                }`}
              >
                {idx + 1}
              </div>
              {idx < 2 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    ["details", "participants", "draw"].indexOf(step) > idx ? "bg-green-500" : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Pool Details */}
        {step === "details" && (
          <Card className="bg-slate-700/50 border-slate-600 p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Create Your Pool</h2>

            <div className="space-y-6">
              <div>
                <Label className="text-white mb-2 block">Pool Name</Label>
                <Input
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                  placeholder="e.g., Office World Cup 2026"
                  className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2 block">Entry Fee</Label>
                  <Input
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    type="number"
                    placeholder="0"
                    className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Currency</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 text-white rounded-md"
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>NGN</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-white mb-2 block">Max Participants</Label>
                <Input
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  type="number"
                  min="2"
                  max="32"
                  className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                />
                <p className="text-sm text-slate-400 mt-2">Maximum 32 (one per team)</p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                className="flex-1 border-slate-600 text-white hover:bg-slate-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleCreatePool}
                disabled={createPoolMutation.isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {createPoolMutation.isPending ? "Creating..." : "Next: Add Participants"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Add Participants */}
        {step === "participants" && (
          <Card className="bg-slate-700/50 border-slate-600 p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Add Participants</h2>
            <p className="text-slate-400 mb-6">
              Add {participants.length}/{maxParticipants} participants
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                <Input
                  value={participantInput}
                  onChange={(e) => setParticipantInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddParticipant()}
                  placeholder="Enter participant name"
                  className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                />
                <Button
                  onClick={handleAddParticipant}
                  disabled={participants.length >= parseInt(maxParticipants)}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Add
                </Button>
              </div>

              {participants.length > 0 && (
                <div className="bg-slate-600/50 rounded-lg p-4">
                  <div className="space-y-2">
                    {participants.map((name, idx) => (
                      <div key={idx} className="flex justify-between items-center text-white">
                        <span>{name}</span>
                        <button
                          onClick={() => handleRemoveParticipant(idx)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep("details")}
                variant="outline"
                className="flex-1 border-slate-600 text-white hover:bg-slate-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleAddParticipants}
                disabled={participants.length === 0 || addParticipantMutation.isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {addParticipantMutation.isPending ? "Adding..." : "Next: Run Draw"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Run Draw */}
        {step === "draw" && (
          <Card className="bg-slate-700/50 border-slate-600 p-8 text-center">
            <Zap className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Draw Teams?</h2>
            <p className="text-slate-400 mb-8">
              {participants.length} participants are ready. Click below to randomly assign World Cup teams!
            </p>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep("participants")}
                variant="outline"
                className="flex-1 border-slate-600 text-white hover:bg-slate-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleExecuteDraw}
                disabled={executDrawMutation.isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-lg py-6"
              >
                {executDrawMutation.isPending ? "Drawing..." : "🎲 Run the Draw"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
