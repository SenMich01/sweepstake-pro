import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";

const questions = [
  {
    q: "Who will win the World Cup 2026?",
    options: ["Brazil", "France", "Argentina", "England"],
  },
  {
    q: "How many teams are in your sweepstake?",
    options: ["4-8", "9-16", "17-32", "32+"],
  },
  {
    q: "What is your goal?",
    options: ["Fun", "Money pool", "Office game", "Competition"],
  },
  {
    q: "How often will you check results?",
    options: ["Daily", "Weekly", "Only finals", "Rarely"],
  },
  {
    q: "Ready to create your sweepstake?",
    options: ["Yes!", "Let’s go!", "Absolutely", "Start now"],
  },
];

export default function QuizGate() {
  const [, navigate] = useLocation();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleAnswer = () => {
    setStep((prev) => {
      if (prev === questions.length - 1) {
        setDone(true); // trigger navigation safely
        return prev;
      }
      return prev + 1;
    });
  };

  // SAFE NAVIGATION (this is the key fix)
  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => {
        navigate("/home");;
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [done, navigate]);

  useEffect(() => {
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [step]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white flex items-center justify-center px-4">
      <div
        ref={containerRef}
        className="w-full max-w-xl bg-white/5 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-md"
      >
        {/* Progress */}
        <div className="mb-6">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all"
              style={{
                width: `${((step + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl font-bold mb-4 text-blue-200">
          {questions[step].q}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {questions[step].options.map((opt) => (
            <button
              key={opt}
              onClick={handleAnswer}
              className="w-full p-3 rounded-xl bg-white/10 hover:bg-blue-500/30 transition"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
