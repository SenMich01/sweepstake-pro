import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Trophy, Users, Share2, FileText, Zap, Check } from "lucide-react";

const features = [
  { icon: <Zap className="w-6 h-6 text-amber-400" />, title: "Instant Draw", desc: "Randomly assign all 32 World Cup teams in seconds. Fair and automatic." },
  { icon: <Trophy className="w-6 h-6 text-amber-400" />, title: "Live Leaderboard", desc: "Track who's winning as teams progress through the tournament." },
  { icon: <FileText className="w-6 h-6 text-amber-400" />, title: "PDF Export", desc: "Download a beautiful draw sheet to print or share digitally." },
  { icon: <Share2 className="w-6 h-6 text-amber-400" />, title: "WhatsApp Sharing", desc: "One-tap sharing to your office or friends group. No app needed." },
];

const faqs = [
  { q: "Do participants need to sign up?", a: "No. Just share the link — anyone with it can view the draw results and leaderboard instantly." },
  { q: "How are teams assigned?", a: "Completely at random using a Fisher-Yates shuffle, so every participant gets a fair draw." },
  { q: "Can I use this for my office?", a: "Yes — it's perfect for offices, schools, WhatsApp groups, bars, and sports clubs." },
  { q: "What happens if I clear my browser?", a: "Your pools are stored on your device. Use the shareable link to access results from other devices." },
  { q: "Is payment required?", a: "No — the free plan supports up to 8 participants. Upgrade for larger groups and PDF exports." },
];

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Nav */}
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-400" />
            <span className="text-2xl font-bold text-white">Sweepstake Pro</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/dashboard")} className="text-slate-400 hover:text-white text-sm transition">
              My Pools
            </button>
            <Button onClick={() => setLocation("/upgrade")} variant="outline" className="border-slate-600 text-white hover:bg-slate-700 text-sm">
              Pricing
            </Button>
            <Button onClick={() => setLocation("/create")} className="bg-amber-500 hover:bg-amber-600 text-white text-sm">
              Create Pool
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/30 rounded-full px-4 py-1.5 text-amber-300 text-sm mb-8">
          ⚽ FIFA World Cup 2026 — USA · Canada · Mexico
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Run Your World Cup<br />
          <span className="text-amber-400">Sweepstake in 60 Seconds</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Assign teams, track results, and share with your office or WhatsApp group — completely free. No sign-up required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setLocation("/create")}
            className="bg-amber-500 hover:bg-amber-600 text-white text-lg px-8 py-4 font-semibold"
          >
            Create Your Sweepstake <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            onClick={() => setLocation("/upgrade")}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700 text-lg px-8 py-4"
          >
            View Pricing
          </Button>
        </div>
        <p className="text-slate-500 text-sm mt-5">Free for up to 8 participants · No account needed</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="bg-slate-700/50 border-slate-600 p-6">
              <div className="mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Create your pool", desc: "Enter pool name, organizer name, and add your participants." },
            { step: "2", title: "Run the draw", desc: "Click Draw — all 32 World Cup teams are randomly assigned instantly." },
            { step: "3", title: "Share the link", desc: "Copy your unique pool link and send it to everyone on WhatsApp or email." },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                {s.step}
              </div>
              <h3 className="text-white font-semibold mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Simple Pricing</h2>
        <p className="text-slate-400 mb-10">One-time payment. No subscription.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Free", price: "$0", features: ["8 participants", "Team draw", "Shareable link", "Leaderboard"], highlight: false },
            { name: "Pro", price: "$9.99", features: ["50 participants", "PDF export", "WhatsApp share", "Custom pool name"], highlight: true },
            { name: "Premium", price: "$24.99", features: ["Unlimited participants", "Multiple pools", "Company logo", "Bulk CSV upload"], highlight: false },
          ].map((p) => (
            <Card key={p.name} className={`p-6 ${p.highlight ? "bg-amber-500/10 border-amber-400/50" : "bg-slate-700/50 border-slate-600"}`}>
              {p.highlight && <div className="text-xs text-amber-400 font-bold mb-2 uppercase tracking-wider">Most Popular</div>}
              <h3 className="text-xl font-bold text-white">{p.name}</h3>
              <p className="text-3xl font-bold text-amber-400 my-2">{p.price}</p>
              <ul className="space-y-2 text-sm text-left mt-4">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <Button onClick={() => setLocation("/upgrade")} className="mt-8 bg-amber-500 hover:bg-amber-600 text-white px-8">
          See Full Pricing →
        </Button>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.q} className="bg-slate-700/50 border-slate-600 p-6">
              <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
              <p className="text-slate-400 text-sm">{faq.a}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to run your sweepstake?</h2>
        <p className="text-slate-400 mb-8">Takes less than 60 seconds. Free to start.</p>
        <Button onClick={() => setLocation("/create")} className="bg-amber-500 hover:bg-amber-600 text-white text-lg px-10 py-4 font-semibold">
          Create Your Pool Now <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8 text-center">
        <p className="text-slate-500 text-sm">
          © 2026 Sweepstake Pro · Built for World Cup 2026 ·{" "}
          <button onClick={() => setLocation("/upgrade")} className="hover:text-slate-300 underline">Pricing</button>
        </p>
      </footer>
    </div>
  );
}
