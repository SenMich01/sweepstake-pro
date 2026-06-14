import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const questions = [
  {
    q: "Who do you think will win the World Cup?",
    options: ["Brazil", "France", "Argentina", "England"],
  },
  {
    q: "How many participants is ideal?",
    options: ["8", "16", "32", "Unlimited"],
  },
  {
    q: "Where are you hosting it?",
    options: ["Office", "Friends group", "School", "Online community"],
  },
  {
    q: "What matters most?",
    options: ["Fair draw", "Design", "Sharing", "Prizes"],
  },
  {
    q: "Would you upgrade?",
    options: ["Yes", "Maybe", "No"],
  },
];

export default function QuizGate() {
  const [, navigate] = useLocation();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const current = questions[step];

  const select = (opt: string) => {
    const copy = [...answers];
    copy[step] = opt;
    setAnswers(copy);
  };

  const next = () => {
    if (!answers[step]) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        navigate("/"); // HOME
      }
    }, 200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-950 via-sky-900 to-white">

      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-blue-200/20 text-white">

        <CardContent className={`p-8 space-y-6 transition-all ${loading ? "opacity-40" : "opacity-100"}`}>

          <div className="text-center">
            <h1 className="text-3xl font-bold">⚽ World Cup Sweepstake</h1>
            <p className="text-blue-100 text-sm">Answer a few questions</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {step + 1}. {current.q}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => select(opt)}
                  className={`p-3 rounded-lg border ${
                    answers[step] === opt
                      ? "bg-blue-500 border-blue-300"
                      : "bg-white/10 border-white/20"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <p className="text-sm">{step + 1} / {questions.length}</p>

            <Button onClick={next} disabled={!answers[step]}>
              {step === questions.length - 1 ? "Enter" : "Next"}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
