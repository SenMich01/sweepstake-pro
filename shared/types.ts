// Re-export database types
export type { User, InsertUser, Pool, InsertPool, Team, InsertTeam, Participant, InsertParticipant, Payment, InsertPayment } from "../drizzle/schema";

// API Response types
export interface PoolWithDetails extends Record<string, unknown> {
  id: number;
  name: string;
  slug: string;
  organizerId: number;
  entryFee: string;
  currency: string;
  maxParticipants: number;
  plan: "free" | "pro";
  status: "draft" | "active" | "completed";
  createdAt: Date;
  updatedAt: Date;
  participants?: ParticipantWithTeam[];
  organizer?: {
    id: number;
    name: string | null;
    email: string | null;
  };
}

export interface ParticipantWithTeam extends Record<string, unknown> {
  id: number;
  poolId: number;
  userId: number | null;
  name: string;
  assignedTeamId: number | null;
  paymentStatus: "pending" | "paid" | "free";
  createdAt: Date;
  team?: {
    id: number;
    name: string;
    group: string | null;
    flagEmoji: string | null;
    points: number;
    stage: string;
  };
}

export interface LeaderboardEntry extends Record<string, unknown> {
  participantId: number;
  participantName: string;
  teamName: string;
  teamFlag: string;
  teamGroup: string;
  points: number;
  stage: string;
  rank: number;
}

export interface DrawResult {
  participantId: number;
  participantName: string;
  teamId: number;
  teamName: string;
  teamFlag: string;
  teamGroup: string;
}

export interface PaystackPaymentData {
  reference: string;
  amount: number;
  status: "success" | "failed" | "pending";
  customer: {
    email: string;
    name: string;
  };
  metadata?: {
    poolId?: number;
    userId?: number;
  };
}

export interface CreatePoolInput {
  name: string;
  entryFee: string;
  currency: string;
  maxParticipants?: number;
}

export interface AddParticipantInput {
  poolId: number;
  name: string;
  paymentStatus?: "pending" | "paid" | "free";
}

export interface DrawInput {
  poolId: number;
}

export interface ExportPdfInput {
  poolId: number;
  format: "results" | "leaderboard" | "both";
}

export interface VerifyPaymentInput {
  reference: string;
  poolId: number;
}
