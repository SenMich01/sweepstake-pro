import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

const PAYSTACK_PRO_LINK =
  "https://paystack.shop/pay/rupgol8wmb";

const PAYSTACK_PREMIUM_LINK =
  "https://paystack.shop/pay/971miiuxli";

export default function Upgrade() {
  const [, navigate] = useLocation();

  const plans = [
    {
      name: "Free",
      price: "$0",
      features: [
        "Up to 8 participants",
        "Draw generator",
        "Shareable link",
        "Leaderboard",
      ],
      action: () => navigate("/create"),
      button: "Get Started Free",
    },
    {
      name: "Pro",
      price: "$9.99",
      popular: true,
      features: [
        "Up to 50 participants",
        "PDF export",
        "WhatsApp sharing",
        "Custom pool name",
      ],
      action: () =>
        window.open(PAYSTACK_PRO_LINK, "_blank"),
      button: "Upgrade to Pro",
    },
    {
      name: "Premium",
      price: "$24.99",
      features: [
        "Unlimited participants",
        "Multiple pools",
        "Company logo on PDF",
        "Bulk CSV upload",
        "Everything in Pro",
      ],
      action: () =>
        window.open(
          PAYSTACK_PREMIUM_LINK,
          "_blank"
        ),
      button: "Upgrade to Premium",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10">
          Upgrade Your Sweepstake
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`bg-slate-800 ${
                plan.popular
                  ? "border-amber-400"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                {plan.popular && (
                  <div className="bg-amber-400 text-black text-xs px-3 py-1 rounded mb-4 inline-block">
                    MOST POPULAR
                  </div>
                )}

                <h2 className="text-2xl font-bold">
                  {plan.name}
                </h2>

                <p className="text-4xl font-bold my-4">
                  {plan.price}
                </p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  onClick={plan.action}
                >
                  {plan.button}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-slate-400 mt-10">
          One-time payment. No recurring subscription.
        </p>
      </div>
    </div>
  );
}
