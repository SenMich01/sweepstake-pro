import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

import {
  getPoolBySlug,
  decodePoolFromHash,
  Pool,
} from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PoolDetail() {
  const { slug } = useParams();
  const [, navigate] = useLocation();

  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let data = await getPoolBySlug(slug);

      if (!data && window.location.hash) {
        data = decodePoolFromHash(window.location.hash.slice(1));
      }

      setPool(data);
      setLoading(false);
    };

    load();
  }, [slug]);

  const exportPDF = async () => {
    if (!pool) return;

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(pool.name, 20, 20);

    doc.setFontSize(12);
    doc.text(`Organizer: ${pool.organizer_name}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);

    doc.setFontSize(14);
    doc.text("Leaderboard", 20, 55);

    let y = 65;

    const sorted = [...pool.participants].sort(
      (a, b) => (b.points ?? 0) - (a.points ?? 0)
    );

    sorted.forEach((p, i) => {
      doc.text(
        `${i + 1}. ${p.name} - ${p.team_name ?? "No team"} (${p.points ?? 0})`,
        20,
        y
      );
      y += 8;
    });

    doc.save(`${pool.slug}-sweepstake.pdf`);

    toast.success("PDF exported");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-3xl">
        ⚽ Loading...
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Card className="bg-slate-800">
          <CardContent className="p-6 text-center">
            <h2>Pool Not Found</h2>
            <Button onClick={() => navigate("/create")}>
              Create Pool
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shareUrl =
    window.location.origin + `/pool/${pool.slug}`;

  const whatsapp = `🎉 Sweepstake Live!\n\n${pool.name}\n\nView: ${shareUrl}`;

  const leaderboard = [...pool.participants].sort(
    (a, b) => (b.points ?? 0) - (a.points ?? 0)
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <Card className="bg-slate-800">
          <CardHeader>
            <CardTitle>{pool.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Organizer: {pool.organizer_name}</p>
            <p>Participants: {pool.participants.length}</p>
          </CardContent>
        </Card>

        {/* ACTIONS */}
        <Card className="bg-slate-800">
          <CardContent className="flex gap-3 flex-wrap">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success("Copied");
              }}
            >
              Copy Link
            </Button>

            <Button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(
                    whatsapp
                  )}`
                )
              }
            >
              WhatsApp
            </Button>

            <Button onClick={exportPDF}>
              Export PDF
            </Button>
          </CardContent>
        </Card>

        {/* LEADERBOARD */}
        <Card className="bg-slate-800">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((p, i) => (
                <div
                  key={p.id}
                  className="flex justify-between border-b border-slate-700 py-2"
                >
                  <span>
                    {i + 1}. {p.name}
                  </span>
                  <span>
                    {p.team_name ?? "No team"} • {p.points ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
