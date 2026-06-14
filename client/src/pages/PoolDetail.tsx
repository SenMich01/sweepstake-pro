import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

import {
  getPoolBySlug,
  decodePoolFromHash,
  encodePoolToHash,
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
    let found = getPoolBySlug(slug);

    if (!found && window.location.hash) {
      found = decodePoolFromHash(
        window.location.hash.slice(1)
      );
    }

    setPool(found ?? null);
    setLoading(false);
  }, [slug]);

  const exportPDF = async () => {
    if (!pool) return;

    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text(pool.name, 20, 25);

    doc.setFontSize(14);
    doc.text(
      `Organizer: ${pool.organizerName}`,
      20,
      40
    );

    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      20,
      50
    );

    doc.addPage();

    let y = 20;

    doc.text("Draw Results", 20, y);

    y += 10;

    pool.participants.forEach((p, index) => {
      doc.text(
        `${index + 1}. ${p.name} - ${
          p.assignedTeam?.name ?? "No Team"
        }`,
        20,
        y
      );

      y += 8;
    });

    doc.save(`${pool.slug}.pdf`);

    toast.success("PDF exported");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-3xl animate-spin">
        ⚽
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Card className="bg-slate-800">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl mb-4">
              Pool Not Found
            </h2>

            <Button
              onClick={() => navigate("/create")}
            >
              Create Your Own
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shareUrl =
    window.location.origin +
    "/pool/" +
    pool.slug +
    "#" +
    encodePoolToHash(pool);

  const leaderboard = [...pool.participants].sort(
    (a, b) =>
      (b.assignedTeam?.points ?? 0) -
      (a.assignedTeam?.points ?? 0)
  );

  const whatsappMessage =
    `🎉 Our World Cup Sweepstake is live!\n\n` +
    `📋 *${pool.name}*\n\n` +
    `View your team: ${shareUrl}`;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
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

        <Card className="bg-slate-800">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
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
                      <td>
                        <span
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
                        </span>
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
