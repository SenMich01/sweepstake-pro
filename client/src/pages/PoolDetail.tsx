import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Share2, Download, Copy, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function PoolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();

  const { data: pool, isLoading } = trpc.pools.getBySlug.useQuery({ slug: slug || "" });
  const { data: leaderboard } = trpc.leaderboard.get.useQuery(
    { poolId: pool?.id || 0 },
    { enabled: !!pool?.id }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <span className="text-2xl font-bold text-white">Sweepstake Pro</span>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-12 w-1/2 mb-4 bg-slate-700" />
          <Skeleton className="h-64 w-full bg-slate-700" />
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Pool Not Found</h1>
          <p className="text-slate-300 mb-6">The pool you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/")} className="bg-amber-500 hover:bg-amber-600 text-white">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/pool/${pool.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleShareWhatsApp = () => {
    const url = `${window.location.origin}/pool/${pool.slug}`;
    const message = `🎉 Join my World Cup Sweepstake! 🏆\n\n${pool.name}\n\nView the results: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
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
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            Home
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">{pool.name}</h1>
          <p className="text-slate-400">
            {pool.status === "draft" && "Draft - Not yet drawn"}
            {pool.status === "active" && "Active - Teams assigned"}
            {pool.status === "completed" && "Completed"}
          </p>
        </div>

        {/* Share Panel */}
        <Card className="bg-slate-700/50 border-slate-600 p-6 mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Share This Pool</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex-1 border-slate-600 text-white hover:bg-slate-600"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              onClick={handleShareWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share on WhatsApp
            </Button>
            <Button
              onClick={() => alert("PDF export coming soon")}
              variant="outline"
              className="flex-1 border-slate-600 text-white hover:bg-slate-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </Card>

        {/* Draw Results */}
        {pool.participants && pool.participants.length > 0 && (
          <Card className="bg-slate-700/50 border-slate-600 p-6 mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6">Draw Results</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pool.participants.map((participant) => {
                const teamEntry = leaderboard?.find((e) => e.participantId === participant.id);
                return (
                  <div
                    key={participant.id}
                    className="bg-slate-600/50 rounded-lg p-4 border border-slate-500 hover:border-amber-400/50 transition-colors"
                  >
                    <div className="text-center">
                      <p className="text-white font-semibold mb-2">{participant.name}</p>
                      <div className="text-4xl mb-2">{teamEntry?.teamFlag || "❓"}</div>
                      <p className="text-amber-400 font-semibold">{teamEntry?.teamName || "Unassigned"}</p>
                      <p className="text-sm text-slate-400 mt-1">{teamEntry?.teamGroup || ""}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Leaderboard */}
        {leaderboard && leaderboard.length > 0 && (
          <Card className="bg-slate-700/50 border-slate-600 p-6">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              Live Leaderboard
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">#</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Participant</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Team</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Stage</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-semibold">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr key={entry.participantId} className="border-b border-slate-700 hover:bg-slate-600/30">
                      <td className="py-3 px-4 text-white font-bold">{entry.rank}</td>
                      <td className="py-3 px-4 text-white">{entry.participantName}</td>
                      <td className="py-3 px-4 text-white">
                        <span className="text-2xl mr-2">{entry.teamFlag}</span>
                        {entry.teamName}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{entry.stage}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-semibold">
                          {entry.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {(!pool.participants || pool.participants.length === 0) && (
          <Card className="bg-slate-700/50 border-slate-600 p-12 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">No Participants Yet</h3>
            <p className="text-slate-400">This pool hasn't been drawn yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
