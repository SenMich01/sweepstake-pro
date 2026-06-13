import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createPool,
  getPoolBySlug,
  getPoolById,
  getUserPools,
  addParticipant,
  getPoolParticipants,
  assignTeamToParticipant,
  getAllTeams,
  getParticipantCount,
  updatePoolStatus,
  updatePoolPlan,
  createPayment,
  getPaymentByReference,
  updatePaymentStatus as updatePaymentStatusDb,
  updateParticipantPaymentStatus,
  getUserById,
} from "./db";
import { generatePoolSlug, shuffleArray } from "./utils";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Pool management
  pools: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          entryFee: z.string().default("0"),
          currency: z.string().default("USD"),
          maxParticipants: z.number().default(8),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const slug = generatePoolSlug(input.name);
        const plan = ctx.user.plan === "pro" ? "pro" : "free";
        const maxParticipants = plan === "pro" ? input.maxParticipants : Math.min(input.maxParticipants, 8);

        const pool = await createPool({
          name: input.name,
          slug,
          organizerId: ctx.user.id,
          entryFee: input.entryFee,
          currency: input.currency,
          maxParticipants,
          plan,
        });

        return { slug, poolId: pool?.id || 0 };
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const pool = await getPoolBySlug(input.slug);
        if (!pool) return null;

        const poolParticipants = await getPoolParticipants(pool.id);
        return { ...pool, participants: poolParticipants };
      }),

    getById: protectedProcedure
      .input(z.object({ poolId: z.number() }))
      .query(async ({ input, ctx }) => {
        const pool = await getPoolById(input.poolId);
        if (!pool) return null;

        // Verify ownership
        if (pool.organizerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        const poolParticipants = await getPoolParticipants(pool.id);
        return { ...pool, participants: poolParticipants };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserPools(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          poolId: z.number(),
          name: z.string().min(1).max(100).optional(),
          maxParticipants: z.number().optional(),
          status: z.enum(["draft", "active", "completed"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const pool = await getPoolById(input.poolId);
        if (!pool) throw new Error("Pool not found");

        if (pool.organizerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // TODO: Implement pool update in database
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ poolId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const pool = await getPoolById(input.poolId);
        if (!pool) throw new Error("Pool not found");

        if (pool.organizerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // Soft delete: mark pool as deleted by setting status to completed
        await updatePoolStatus(input.poolId, "completed");
        return { success: true };
      }),
  }),

  // Participant management
  participants: router({
    add: protectedProcedure
      .input(
        z.object({
          poolId: z.number(),
          name: z.string().min(1).max(128),
          paymentStatus: z.enum(["pending", "paid", "free"]).default("free"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const pool = await getPoolById(input.poolId);
        if (!pool) throw new Error("Pool not found");

        // Verify ownership or participation
        if (pool.organizerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        const count = await getParticipantCount(input.poolId);
        const maxParticipants = pool.maxParticipants || 8;
        if (count >= maxParticipants) {
          throw new Error("Pool is full");
        }

        await addParticipant({
          poolId: input.poolId,
          userId: ctx.user.id,
          name: input.name,
          paymentStatus: input.paymentStatus,
        });

        return { success: true };
      }),

    list: publicProcedure
      .input(z.object({ poolId: z.number() }))
      .query(async ({ input }) => {
        return getPoolParticipants(input.poolId);
      }),

    updatePaymentStatus: protectedProcedure
      .input(
        z.object({
          participantId: z.number(),
          poolId: z.number(),
          paymentStatus: z.enum(["pending", "paid", "free"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const pool = await getPoolById(input.poolId);
        if (!pool) throw new Error("Pool not found");

        // Verify organizer authorization
        if (pool.organizerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        await updateParticipantPaymentStatus(input.participantId, input.paymentStatus);
        return { success: true };
      }),
  }),

  // Draw functionality
  draw: router({
    execute: protectedProcedure
      .input(z.object({ poolId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const pool = await getPoolById(input.poolId);
        if (!pool) throw new Error("Pool not found");

        if (pool.organizerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        if (pool.status !== "draft") {
          throw new Error("Pool already drawn");
        }

        const poolParticipants = await getPoolParticipants(input.poolId);
        const allTeams = await getAllTeams();

        if (poolParticipants.length === 0) {
          throw new Error("No participants in pool");
        }

        if (poolParticipants.length > allTeams.length) {
          throw new Error("Not enough teams for participants");
        }

        // Shuffle teams and assign
        const shuffledTeams = shuffleArray(allTeams);
        const assignments = [];

        for (let i = 0; i < poolParticipants.length; i++) {
          const participant = poolParticipants[i];
          const team = shuffledTeams[i];

          if (participant && team) {
            await assignTeamToParticipant(participant.id, team.id);
            assignments.push({
              participantId: participant.id,
              participantName: participant.name,
              teamId: team.id,
              teamName: team.name,
              teamFlag: team.flagEmoji,
              teamGroup: team.group,
            });
          }
        }

        // Update pool status
        await updatePoolStatus(input.poolId, "active");

        return { assignments };
      }),

    getResults: publicProcedure
      .input(z.object({ poolId: z.number() }))
      .query(async ({ input }) => {
        const poolParticipants = await getPoolParticipants(input.poolId);
        const results = [];

        for (const participant of poolParticipants) {
          if (participant.assignedTeamId) {
            const team = await getAllTeams();
            const assignedTeam = team.find((t) => t.id === participant.assignedTeamId);
            if (assignedTeam) {
              results.push({
                participantId: participant.id,
                participantName: participant.name,
                teamId: assignedTeam.id,
                teamName: assignedTeam.name,
                teamFlag: assignedTeam.flagEmoji,
                teamGroup: assignedTeam.group,
                points: assignedTeam.points,
                stage: assignedTeam.stage,
              });
            }
          }
        }

        return results;
      }),
  }),

  // Leaderboard
  leaderboard: router({
    get: publicProcedure
      .input(z.object({ poolId: z.number() }))
      .query(async ({ input }) => {
        const poolParticipants = await getPoolParticipants(input.poolId);
        const allTeams = await getAllTeams();

        const leaderboard = poolParticipants
          .map((participant) => {
            const team = allTeams.find((t) => t.id === participant.assignedTeamId);
            return {
              participantId: participant.id,
              participantName: participant.name,
              teamName: team?.name || "Unassigned",
              teamFlag: team?.flagEmoji || "",
              teamGroup: team?.group || "",
              points: team?.points || 0,
              stage: team?.stage || "Group Stage",
            };
          })
          .sort((a, b) => b.points - a.points)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));

        return leaderboard;
      }),
  }),

  // Payment & Upgrade
  payments: router({
    initiateUpgrade: protectedProcedure
      .input(
        z.object({
          plan: z.enum(["pro"]),
          amount: z.string(),
          currency: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createPayment({
          poolId: 0, // Upgrade payment
          userId: ctx.user.id,
          amount: input.amount,
          status: "pending",
        });

        return { success: true };
      }),

    verifyPayment: protectedProcedure
      .input(
        z.object({
          reference: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const payment = await getPaymentByReference(input.reference);
        if (!payment) throw new Error("Payment not found");

        if (payment.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // TODO: Call Paystack API to verify payment
        // For now, mark as success
        await updatePaymentStatusDb(payment.id, "success");

        // Upgrade user plan
        // TODO: Implement user plan upgrade

        return { success: true };
      }),
  }),

  // Teams
  teams: router({
    list: publicProcedure.query(async () => {
      return getAllTeams();
    }),

    updatePoints: protectedProcedure
      .input(
        z.object({
          teamId: z.number(),
          points: z.number(),
          stage: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admin can update points
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        // TODO: Implement team points update
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
