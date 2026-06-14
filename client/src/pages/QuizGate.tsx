import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function QuizGate() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);

  const questions = [
    "Who will win the World Cup?",
    "How many participants in your pool?",
    "Is this for friends or office?",
    "Do you want prizes?",
    "Ready to create your sweepstake?"
  ];

  const isLastStep = step === questions.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      // ✅ IMPORTANT: navigate AFTER state completes
      navigate("/home"); // or "/dashboard" if that's your main page
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 text-white flex items-center justify-center p-6">

      <Card className="bg-slate-800 w-full max-w-xl">
        <CardContent className="p-6 space-y-6">

          <h1 className="text-xl font-bold">
            World Cup Sweepstake Builder
          </h1>

          <p className="text-slate-300">
            {questions[step]}
          </p>

          <div className="flex gap-3">
            <Button onClick={handleNext}>
              {isLastStep ? "Start Your Sweepstake" : "Continue"}
            </Button>

            {step > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
