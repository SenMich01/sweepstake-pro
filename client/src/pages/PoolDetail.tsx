import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

import {
  getPoolBySlug,
  decodePoolFromHash,
  Pool,
} from "@/lib/store";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PoolDetail() {
  const { slug } = useParams();
  const [, navigate] = useLocation();

  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      let found = slug ? getPoolBySlug(slug) : undefined;

      if (!found && window.location.hash) {
        found = decodePoolFromHash(
          window.location.hash.slice(1)
        );
      }

      setPool(found ?? null);
    } catch (err) {
      console.error(err);
      setPool(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  /* ---------------- PDF EXPORT ---------------- */
  const exportPDF = async () => {
    if (!pool) return;

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const date = new Date().toLocaleDateString();

    // HEADER
    doc.setFontSize(20);
    doc.text("Sweepstake Pro", 14, 20);

    doc.setFontSize(16);
    doc.text(pool.name, 14, 32);

    doc.setFontSize(11);
    doc.text(`Organizer: ${pool.organizerName}`, 14, 42);
    doc.text(`Date: ${date}`, 14, 50);

    doc.line(14, 55, 195, 55);

    // TABLE HEADER
    let y = 65;

    doc.setFontSize(12);
    doc.text("#", 14, y);
    doc.text("Participant", 25, y);
    doc.text("Team", 85, y);
    doc.text("Group", 140, y);
    doc.text("Pts", 170, y);

    y += 10;

    // SORT LEADERBOARD
    const sorted = [...pool.participants].sort(
      (a, b) =>
        (b.assignedTeam?.points ?? 0) -
        (a.assignedTeam?.points ?? 0)
    );

    // ROWS
    sorted.forEach((p, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);

      doc.text(String(index + 1), 14, y);
      doc.text(p.name || "-", 25, y);
      doc.text(p.assignedTeam?.name || "Unassigned", 85, y);
      doc.text(p.assignedTeam?.group || "-", 140, y);
      doc.text(
        String(p.assignedTeam?.points ?? 0),
        170,
        y
      );

      y += 8;
    });

    doc.save(`${pool.slug}-sweepstake.pdf`);

    toast.success("PDF exported successfully");
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-3xl animate-spin">
        ⚽
      </div>
    );
  }

  /* ---------------- NOT FOUND ---------------- */
  if (!pool) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <Card className="bg-slate-800 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl mb-4">
              Pool Not Found
            </h2>

            <Button onClick={() => navigate("/create")}>
              Create Your Own
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------- SHARE DATA ---------------- */
  const shareUrl =
    `${window.location.origin}/pool/${pool.slug}`;

  const whatsappMessage =
    `🎉 Our World Cup Sweepstake is live!\n\n` +
    `📋 *${pool.name}*\n\n` +
    `View your team: ${shareUrl}`;

  const leaderboard = [...pool.participants].sort(
    (a, b) =>
      (b.assignedTeam?.points ?? 0) -
      (a.assignedTeam?.points ?? 0)
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <Card className="bg-slate-800">
          <CardHeader>
            <CardTitle>{pool.name}</CardTitle>
          </CardHeader>

          <CardContent>
            <p>Organizer: {pool.organizerName}</p>
            <p>
              Participants: {pool.participants.length}
            </p>
          </CardContent>
        </Card>

        {/* SHARE */}
        <Card className="bg-slate-800">
          <CardHeader>
            <CardTitle>Share Pool</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-3">
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(
                  shareUrl
                );
                toast.success("Link copied");
              }}
            >
              Copy Link
            </Button>

            <Button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(
                    whatsappMessage
                  )}`,
                  "_blank"
                )
              }
            >
              WhatsApp Share
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-700">
                    <th>#</th>
                    <th>Flag</th>
                    <th>Participant</th>
                    <th>Team</th>
                    <th>Points</th>
                    <th>Stage</th>
                  </tr>
                </thead>

                <tbody>
                  {leaderboard.map((p, i) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-700"
                    >
                      <td
                        className={
                          i === 0
                            ? "text-yellow-400"
                            : i === 1
                            ? "text-slate-300"
                            : i === 2
                            ? "text-amber-700"
                            : ""
                        }
                      >
                        {i + 1}
                      </td>

                      <td>
                        {p.assignedTeam?.flagEmoji}
                      </td>

                      <td>{p.name}</td>

                      <td>
                        {p.assignedTeam?.name} (
                        {p.assignedTeam?.group})
                      </td>

                      <td>
                        {p.assignedTeam?.points}
                      </td>

                      <td>
                        {p.assignedTeam?.stage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
