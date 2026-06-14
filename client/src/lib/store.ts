// ============================================================
// SWEEPSTAKE PRO - localStorage store (replaces MySQL + tRPC)
// ============================================================

export interface Team {
  id: number;
  name: string;
  group: string;
  flagEmoji: string;
  points: number;
  stage: string;
}

export interface Participant {
  id: string;
  name: string;
  assignedTeam: Team | null;
}

export interface Pool {
  id: string;
  slug: string;
  name: string;
  organizerName: string;
  plan: "free" | "pro" | "premium";
  status: "draft" | "active";
  createdAt: string;
  participants: Participant[];
}

// All 32 World Cup 2026 teams
export const ALL_TEAMS: Team[] = [
  { id: 1, name: "Argentina", group: "A", flagEmoji: "🇦🇷", points: 0, stage: "Group Stage" },
  { id: 2, name: "Australia", group: "A", flagEmoji: "🇦🇺", points: 0, stage: "Group Stage" },
  { id: 3, name: "Poland", group: "A", flagEmoji: "🇵🇱", points: 0, stage: "Group Stage" },
  { id: 4, name: "Saudi Arabia", group: "A", flagEmoji: "🇸🇦", points: 0, stage: "Group Stage" },
  { id: 5, name: "France", group: "B", flagEmoji: "🇫🇷", points: 0, stage: "Group Stage" },
  { id: 6, name: "Denmark", group: "B", flagEmoji: "🇩🇰", points: 0, stage: "Group Stage" },
  { id: 7, name: "Tunisia", group: "B", flagEmoji: "🇹🇳", points: 0, stage: "Group Stage" },
  { id: 8, name: "Peru", group: "B", flagEmoji: "🇵🇪", points: 0, stage: "Group Stage" },
  { id: 9, name: "Spain", group: "C", flagEmoji: "🇪🇸", points: 0, stage: "Group Stage" },
  { id: 10, name: "Germany", group: "C", flagEmoji: "🇩🇪", points: 0, stage: "Group Stage" },
  { id: 11, name: "Japan", group: "C", flagEmoji: "🇯🇵", points: 0, stage: "Group Stage" },
  { id: 12, name: "Costa Rica", group: "C", flagEmoji: "🇨🇷", points: 0, stage: "Group Stage" },
  { id: 13, name: "England", group: "D", flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 0, stage: "Group Stage" },
  { id: 14, name: "USA", group: "D", flagEmoji: "🇺🇸", points: 0, stage: "Group Stage" },
  { id: 15, name: "Iran", group: "D", flagEmoji: "🇮🇷", points: 0, stage: "Group Stage" },
  { id: 16, name: "Wales", group: "D", flagEmoji: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", points: 0, stage: "Group Stage" },
  { id: 17, name: "Brazil", group: "E", flagEmoji: "🇧🇷", points: 0, stage: "Group Stage" },
  { id: 18, name: "Switzerland", group: "E", flagEmoji: "🇨🇭", points: 0, stage: "Group Stage" },
  { id: 19, name: "Serbia", group: "E", flagEmoji: "🇷🇸", points: 0, stage: "Group Stage" },
  { id: 20, name: "Cameroon", group: "E", flagEmoji: "🇨🇲", points: 0, stage: "Group Stage" },
  { id: 21, name: "Belgium", group: "F", flagEmoji: "🇧🇪", points: 0, stage: "Group Stage" },
  { id: 22, name: "Croatia", group: "F", flagEmoji: "🇭🇷", points: 0, stage: "Group Stage" },
  { id: 23, name: "Morocco", group: "F", flagEmoji: "🇲🇦", points: 0, stage: "Group Stage" },
  { id: 24, name: "Canada", group: "F", flagEmoji: "🇨🇦", points: 0, stage: "Group Stage" },
  { id: 25, name: "Portugal", group: "G", flagEmoji: "🇵🇹", points: 0, stage: "Group Stage" },
  { id: 26, name: "Uruguay", group: "G", flagEmoji: "🇺🇾", points: 0, stage: "Group Stage" },
  { id: 27, name: "South Korea", group: "G", flagEmoji: "🇰🇷", points: 0, stage: "Group Stage" },
  { id: 28, name: "Ghana", group: "G", flagEmoji: "🇬🇭", points: 0, stage: "Group Stage" },
  { id: 29, name: "Netherlands", group: "H", flagEmoji: "🇳🇱", points: 0, stage: "Group Stage" },
  { id: 30, name: "Senegal", group: "H", flagEmoji: "🇸🇳", points: 0, stage: "Group Stage" },
  { id: 31, name: "Ecuador", group: "H", flagEmoji: "🇪🇨", points: 0, stage: "Group Stage" },
  { id: 32, name: "Qatar", group: "H", flagEmoji: "🇶🇦", points: 0, stage: "Group Stage" },
];

const STORAGE_KEY = "sweepstake_pro_pools";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${generateId()}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- CRUD ----

export function getAllPools(): Pool[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePools(pools: Pool[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pools));
}

export function getPoolBySlug(slug: string): Pool | undefined {
  return getAllPools().find((p) => p.slug === slug);
}

export function createPool(input: {
  name: string;
  organizerName: string;
  plan?: "free" | "pro" | "premium";
}): Pool {
  const pool: Pool = {
    id: generateId(),
    slug: generateSlug(input.name),
    name: input.name,
    organizerName: input.organizerName,
    plan: input.plan ?? "free",
    status: "draft",
    createdAt: new Date().toISOString(),
    participants: [],
  };
  const pools = getAllPools();
  pools.push(pool);
  savePools(pools);
  return pool;
}

export function addParticipants(slug: string, names: string[]): Pool | null {
  const pools = getAllPools();
  const idx = pools.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;

  const newParticipants: Participant[] = names.map((name) => ({
    id: generateId(),
    name,
    assignedTeam: null,
  }));

  pools[idx].participants = [...pools[idx].participants, ...newParticipants];
  savePools(pools);
  return pools[idx];
}

export function runDraw(slug: string): Pool | null {
  const pools = getAllPools();
  const idx = pools.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;

  const pool = pools[idx];
  const shuffledTeams = shuffle(ALL_TEAMS).slice(0, pool.participants.length);

  pool.participants = pool.participants.map((p, i) => ({
    ...p,
    assignedTeam: shuffledTeams[i],
  }));
  pool.status = "active";
  savePools(pools);
  return pool;
}

export function deletePool(slug: string): void {
  const pools = getAllPools().filter((p) => p.slug !== slug);
  savePools(pools);
}

export function getMaxParticipants(plan: Pool["plan"]): number {
  if (plan === "premium") return 999;
  if (plan === "pro") return 50;
  return 8;
}

export function encodePoolToHash(pool: Pool): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(pool))));
}

export function decodePoolFromHash(hash: string): Pool | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(hash))));
  } catch {
    return null;
  }
}
