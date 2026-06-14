import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const questions = [
  {
    q: "How many people are joining your sweepstake?",
    options: ["2–8", "9–20", "21–50", "50+"],
  },
  {
    q: "Where will you run it?",
    options: ["Office", "Friends", "WhatsApp group", "School/Club"],
  },
  {
    q: "Do you want a winner prize?",
    options: ["Yes", "No", "Not sure yet"],
  },
  {
    q: "How important is sharing results?",
    options: ["Very important", "Somewhat", "Not important"],
  },
  {
    q: "Would you like automatic team drawing?",
    options: ["Yes", "No"],
  },
];

export default function QuizGate() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <Card className="bg-slate-800 w-full max-w-xl">
        <CardContent className="p-6 space-y-6">

          <h1 className="text-xl font-bold text-white">
            Quick Setup (30 seconds)
          </h1>

          <p className="text-slate-300">
            {questions[step].q}
          </p>

          <div className="space-y-2">
            {questions[step].options.map((opt) => (
              <Button
                key={opt}
                variant="outline"
                className="w-full"
                onClick={next}
              >
                {opt}
              </Button>
            ))}
          </div>

          <p className="text-sm text-slate-400">
            Step {step + 1} of {questions.length}
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
