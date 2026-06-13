import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Upgrade() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Sign In Required</h1>
          <p className="text-slate-300 mb-6">Please sign in to upgrade your account.</p>
          <Button onClick={() => setLocation("/")} className="bg-amber-500 hover:bg-amber-600 text-white">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleUpgradeToPro = async () => {
    // In production, use actual Paystack payment link from environment
    const paystackLink = process.env.VITE_PAYSTACK_PRO_LINK;
    if (paystackLink) {
      window.location.href = paystackLink;
    } else {
      toast.info("Paystack payment link not configured. Please contact support.");
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Upgrade to Pro</h1>
          <p className="text-xl text-slate-400">Unlock unlimited pools and advanced features</p>
        </div>

        {/* Current Plan */}
        <Card className="bg-slate-700/50 border-slate-600 p-6 mb-12 max-w-2xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Current Plan</h3>
              <p className="text-slate-400">
                {user?.plan === "pro" ? "Pro" : "Free"} - {user?.plan === "pro" ? "$9.99/month" : "Free forever"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-400">
                {user?.plan === "pro" ? "$9.99" : "$0"}
              </p>
              <p className="text-sm text-slate-400">per month</p>
            </div>
          </div>
        </Card>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Free Plan */}
          <Card className="bg-slate-700/50 border-slate-600 p-8">
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <p className="text-slate-400 mb-6">Current plan</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-slate-400 ml-2">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                "Up to 8 participants per pool",
                "1 active pool",
                "Instant team draw",
                "Live leaderboard",
                "PDF export",
                "WhatsApp sharing",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button disabled className="w-full bg-slate-600 text-white cursor-not-allowed">
              Current Plan
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-400/50 p-8 ring-1 ring-amber-400/30 relative">
            <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
              RECOMMENDED
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <p className="text-slate-400 mb-6">Unlimited possibilities</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">$9.99</span>
              <span className="text-slate-400 ml-2">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                "Up to 50 participants per pool",
                "Unlimited active pools",
                "Instant team draw",
                "Live leaderboard",
                "PDF export",
                "WhatsApp sharing",
                "Advanced analytics",
                "Priority support",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            {user?.plan === "pro" ? (
              <Button disabled className="w-full bg-amber-600 text-white cursor-not-allowed">
                Current Plan
              </Button>
            ) : (
              <Button
                onClick={handleUpgradeToPro}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                Upgrade to Pro <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription anytime without penalties.",
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 7-day money-back guarantee if you're not satisfied.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards and digital payment methods through Paystack.",
              },
              {
                q: "Can I upgrade or downgrade later?",
                a: "Yes, you can change your plan at any time from your account settings.",
              },
            ].map((faq, idx) => (
              <Card key={idx} className="bg-slate-700/50 border-slate-600 p-6">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
