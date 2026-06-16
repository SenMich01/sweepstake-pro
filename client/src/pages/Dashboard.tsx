import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Pool = {
  id: string;
  slug: string;
  name: string;
  organizer_name: string;
  plan: string;
  status: string;
  created_at: string;
};

export default function Dashboard() {
  const [, navigate] = useLocation();

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [pools, setPools] = useState<Pool[]>([]);

  const [poolName, setPoolName] = useState("");
  const [organizerName, setOrganizerName] =
    useState("");

  const loadPools = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("pools")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      toast.error(error.message);
      return;
    }

    setPools(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPools();
  }, []);

  const handleCreatePool = async () => {
    if (!poolName || !organizerName) {
      toast.error("Fill all fields");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    setCreating(true);

    const slug =
      poolName
        .toLowerCase()
        .replace(/\s+/g, "-") +
      "-" +
      Date.now();

    const { data, error } = await supabase
      .from("pools")
      .insert({
        slug,
        name: poolName,
        organizer_name: organizerName,
        plan: "free",
        status: "draft",
        user_id: user.id,
      })
      .select()
      .single();

    setCreating(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Pool created");

    setPoolName("");
    setOrganizerName("");

    navigate(`/pool/${data.slug}`);
  };

  const handleDelete = async (
    id: string
  ) => {
    const confirmed = confirm(
      "Delete this pool?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("pools")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Pool deleted");

    loadPools();
  };

  const logout = async () => {
    await supabase.auth.signOut();

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto p-6">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              My Pools
            </h1>

            <p className="text-slate-400">
              Manage your sweepstakes
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Create Pool
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              value={poolName}
              onChange={(e) =>
                setPoolName(e.target.value)
              }
              placeholder="Pool Name"
              className="p-3 rounded-lg bg-slate-700"
            />

            <input
              value={organizerName}
              onChange={(e) =>
                setOrganizerName(
                  e.target.value
                )
              }
              placeholder="Organizer Name"
              className="p-3 rounded-lg bg-slate-700"
            />
          </div>

          <button
            onClick={handleCreatePool}
            disabled={creating}
            className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
          >
            {creating
              ? "Creating..."
              : "Create Pool"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            Loading pools...
          </div>
        ) : pools.length === 0 ? (
          <div className="bg-slate-800 p-8 rounded-2xl text-center">
            No pools created yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pools.map((pool) => (
              <div
                key={pool.id}
                className="bg-slate-800 rounded-2xl p-5"
              >
                <h3 className="text-xl font-bold">
                  {pool.name}
                </h3>

                <p className="text-slate-400 mt-2">
                  {pool.organizer_name}
                </p>

                <p className="text-slate-500 text-sm">
                  {pool.status}
                </p>

                <div className="flex gap-2 mt-5">

                  <button
                    onClick={() =>
                      navigate(
                        `/pool/${pool.slug}`
                      )
                    }
                    className="flex-1 bg-blue-600 py-2 rounded-lg"
                  >
                    Open
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(pool.id)
                    }
                    className="bg-red-600 px-4 rounded-lg"
                  >
                    Delete
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
