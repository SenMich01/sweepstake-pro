import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function QuizGate() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);

  const questions = [
    {
      q: "Who will win the World Cup?",
      options: ["Brazil", "France", "Argentina", "England"]
    },
    {
      q: "How many people are joining your sweepstake?",
      options: ["1-10", "10-25", "25-50", "50+"]
    },
    {
      q: "Where are you hosting it?",
      options: ["Office", "Friends group", "Family", "School"]
    },
    {
      q: "Do you want prizes involved?",
      options: ["Yes", "No", "Maybe"]
    },
    {
      q: "Ready to create your sweepstake?",
      options: ["Let’s go!", "Not yet"]
    }
  ];

  const isLast = step === questions.length - 1;

  const next = () => {
    if (isLast) {
      navigate("/home");
      return;
    }
    setStep((s) => s + 1);
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const current = questions[step];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-black text-white p-6">

      <Card className="w-full max-w-xl bg-slate-800 border border-blue-500/30 shadow-xl">
        <CardContent className="p-6 space-y-6">

          {/* Progress */}
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <h1 className="text-xl font-bold text-center">
            {current.q}
          </h1>

          {/* Options */}
          <div className="grid gap-3">
            {current.options.map((opt) => (
              <button
                key={opt}
                className="p-3 rounded-lg bg-slate-700 hover:bg-blue-600 transition"
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              Back
            </Button>

            <Button onClick={next}>
              {isLast ? "Start Sweepstake" : "Next"}
            </Button>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
