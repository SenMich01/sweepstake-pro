import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Plus, Eye, Trash2, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: pools, isLoading } = trpc.pools.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-300 mb-6">Please sign in to view your pools.</p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Go Home
          </Button>
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
            <span className="text-2xl font-bold text-white">Sweepstake Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">{user?.name || user?.email}</span>
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Pools</h1>
            <p className="text-slate-400">Manage and track all your World Cup sweepstakes</p>
          </div>
          <Button
            onClick={() => setLocation("/create")}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Pool
          </Button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-700/50 border-slate-600 p-6">
                <Skeleton className="h-6 w-3/4 mb-4 bg-slate-600" />
                <Skeleton className="h-4 w-1/2 mb-6 bg-slate-600" />
                <Skeleton className="h-10 w-full bg-slate-600" />
              </Card>
            ))}
          </div>
        ) : pools && pools.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <Card
                key={pool.id}
                className="bg-slate-700/50 border-slate-600 hover:border-amber-400/50 transition-colors p-6"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-1">{pool.name}</h3>
                  <p className="text-sm text-slate-400">
                    {pool.status === "draft" && "Draft"}
                    {pool.status === "active" && "Active"}
                    {pool.status === "completed" && "Completed"}
                  </p>
                </div>

                <div className="space-y-2 mb-6 text-sm text-slate-300">
                  <p>
                    <span className="font-semibold">Plan:</span> {pool.plan === "free" ? "Free" : "Pro"}
                  </p>
                  <p>
                    <span className="font-semibold">Max Participants:</span> {pool.maxParticipants}
                  </p>
                  <p>
                    <span className="font-semibold">Created:</span> {formatDate(new Date(pool.createdAt))}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setLocation(`/pool/${pool.slug}`)}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    onClick={() => alert("PDF export coming soon")}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button
                    onClick={() => alert("Delete pool coming soon")}
                    size="sm"
                    variant="outline"
                    className="border-red-600/50 text-red-400 hover:bg-red-600/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-700/50 border-slate-600 p-12 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">No Pools Yet</h3>
            <p className="text-slate-400 mb-6">Create your first World Cup sweepstake pool to get started.</p>
            <Button
              onClick={() => setLocation("/create")}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Create Your First Pool <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
