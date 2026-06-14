import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

import {
  getPoolBySlug,
  decodePoolFromHash,
  Pool,
} from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PoolDetail() {
  const { slug } = useParams();
  const [, navigate] = useLocation();

  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let data = await getPoolBySlug(slug);

      if (!data && window.location.hash) {
        data = decodePoolFromHash(
          window.location.hash.slice(1)
        );
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

    doc.text(pool.name, 20, 20);
    doc.text(`Organizer: ${pool.organizer_name}`, 20, 30);

    let y = 50;

    pool.participants.forEach((p, i) => {
      doc.text(
        `${i + 1}. ${p.name} - ${p.team_name ?? "No team"}`,
        20,
        y
      );
      y += 10;
    });

    doc.save(`${pool.slug}.pdf`);

    toast.success("PDF exported");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    );

  if (!pool)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Button onClick={() => navigate("/create")}>
          Create Pool
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <Card className="bg-slate-800">
          <CardContent className="p-4">
            <h1 className="text-xl">{pool.name}</h1>
            <p>{pool.organizer_name}</p>
          </CardContent>
        </Card>

        <Button onClick={exportPDF}>
          Export PDF
        </Button>

        <div className="space-y-2">
          {pool.participants.map((p) => (
            <div key={p.id} className="p-2 bg-slate-800 rounded">
              {p.name} — {p.team_name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
