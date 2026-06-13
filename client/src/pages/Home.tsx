import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowRight, Trophy, Users, Share2, FileText, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-400" />
            <span className="text-2xl font-bold text-white">Sweepstake Pro</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-slate-300">{user?.name || user?.email}</span>
                <Button
                  onClick={() => setLocation("/dashboard")}
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight">
              Run Your World Cup Sweepstake in 60 Seconds
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Create an office pool, assign teams, track results, and share with your group — all for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button
                  onClick={() => setLocation("/create")}
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white text-lg px-8 py-6"
                >
                  Create Your Sweepstake <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white text-lg px-8 py-6"
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setLocation("/pool/demo")}
                className="border-slate-600 text-white hover:bg-slate-700 text-lg px-8 py-6"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Why Choose Sweepstake Pro?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Draw",
                description: "Randomly assign World Cup teams to participants with one click",
              },
              {
                icon: Trophy,
                title: "Live Leaderboard",
                description: "Track standings in real-time as teams progress through the tournament",
              },
              {
                icon: Share2,
                title: "Easy Sharing",
                description: "Share your pool on WhatsApp, email, or copy a direct link",
              },
              {
                icon: FileText,
                title: "PDF Export",
                description: "Download draw results and leaderboard for printing or sharing",
              },
              {
                icon: Users,
                title: "Team Management",
                description: "Add unlimited participants and manage your pool effortlessly",
              },
              {
                icon: Trophy,
                title: "Pro Features",
                description: "Upgrade for multiple pools and advanced customization options",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="bg-slate-700/50 border-slate-600 hover:border-amber-400/50 transition-colors p-6"
              >
                <feature.icon className="w-12 h-12 text-amber-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-slate-700/50 border-slate-600 p-8 relative">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <p className="text-slate-300 mb-6">Perfect for getting started</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-400 ml-2">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "Up to 8 participants per pool",
                  "Instant team draw",
                  "Live leaderboard",
                  "PDF export",
                  "WhatsApp sharing",
                  "1 active pool",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400 mr-3 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              {isAuthenticated ? (
                <Button
                  onClick={() => setLocation("/create")}
                  className="w-full bg-slate-600 hover:bg-slate-500 text-white"
                >
                  Get Started
                </Button>
              ) : (
                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="w-full bg-slate-600 hover:bg-slate-500 text-white"
                >
                  Sign Up Free
                </Button>
              )}
            </Card>

            {/* Pro Plan */}
            <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-400/50 p-8 relative ring-1 ring-amber-400/30">
              <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-slate-300 mb-6">For serious pool managers</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-slate-400 ml-2">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "Up to 50 participants per pool",
                  "Unlimited active pools",
                  "All Free features",
                  "Custom pool settings",
                  "Advanced analytics",
                  "Priority support",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400 mr-3 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => setLocation("/upgrade")}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                Upgrade to Pro
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Run Your Sweepstake?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of users creating amazing World Cup pools. It takes less than a minute.
          </p>
          {isAuthenticated ? (
            <Button
              onClick={() => setLocation("/create")}
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white text-lg px-8 py-6"
            >
              Create Your Pool Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white text-lg px-8 py-6"
            >
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Follow</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2026 Sweepstake Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
