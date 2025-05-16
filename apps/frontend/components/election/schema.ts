import { z } from "zod";

export const electionSchema = z.object({
  name: z.string().min(1, "Election name required"),
  description: z.string().optional(),
  dateRange: z.object({
    from: z.date({ required_error: "Start date is required" }),
    to: z.date({ required_error: "End date is required" }),
  }),
});

export const positionSchema = z.object({
  name: z.string().min(1, "Position name is required"),
  description: z.string().optional(),
  electionId: z.string().min(1, "Election ID required"),
});

export const candidateSchema = z.object({
  name: z.string().min(1, "Candidate name required"),
  bio: z.string().optional(),
  party: z.string().optional(),
  image: z.string().optional(),
  positionId: z.string().min(1, "Position is required"),
  electionId: z.string().min(1, "Election is required"),
});

export type ElectionFormType = z.infer<typeof electionSchema>;
export type PositionFormType = z.infer<typeof positionSchema>;
export type CandidateFormType = z.infer<typeof candidateSchema>;
