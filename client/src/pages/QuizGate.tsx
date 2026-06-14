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
    q: "How many participants is ideal for a sweepstake?",
    options: ["8", "16", "32", "Unlimited"],
  },
  {
    q: "Where are you hosting your sweepstake?",
    options: ["Office", "Friends group", "School", "Online community"],
  },
  {
    q: "What matters most in a sweepstake?",
    options: ["Fair draw", "Design", "Sharing", "Winning prizes"],
  },
  {
    q: "Would you upgrade for more features?",
    options: ["Yes", "Maybe", "No"],
  },
];

export default function QuizGate() {
  const [, navigate] = useLocation();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const current = questions[step];

  const selectOption = (option: string) => {
    const updated = [...answers];
    updated[step] = option;
    setAnswers(updated);
  };

  const nextStep = () => {
    if (!answers[step]) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        navigate("/"); // send user into homepage after quiz
      }
    }, 250);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-950 via-sky-900 to-white">

      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-blue-200/20 text-white shadow-2xl">

        <CardContent
          className={`p-8 space-y-6 transition-all duration-300 ${
            loading ? "opacity-40 scale-95" : "opacity-100 scale-100"
          }`}
        >

          {/* HEADER */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              ⚽ World Cup Sweepstake Builder
            </h1>
            <p className="text-blue-100 text-sm">
              Answer a few quick questions before entering the app
            </p>
          </div>

          {/* QUESTION */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {step + 1}. {current.q}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.options.map((option) => (
                <button
                  key={option}
                  onClick={() => selectOption(option)}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    answers[step] === option
                      ? "bg-blue-500 border-blue-300 text-white"
                      : "bg-white/10 border-white/20 hover:bg-white/20"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <p className="text-sm text-blue-100">
              {step + 1} / {questions.length}
            </p>

            <Button
              onClick={nextStep}
              disabled={!answers[step]}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {step === questions.length - 1 ? "Enter App" : "Next"}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
