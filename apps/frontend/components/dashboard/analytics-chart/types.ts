/**
 * Type for a single data point in the vote transmission analytics chart.
 * Each entry represents a timestamped event with cumulative counts for each stage.
 */
/**
 * Type for a single data point in the vote transmission analytics chart.
 * Each entry represents a timestamped event with cumulative counts for each stage.
 *
 * Supports dynamic access via `${Candidate}_offChain` and `${Candidate}_onChain`.
 */
export type Candidate = "Alice" | "Bob" | "Charlie";

export type VoteTransmissionTimeData = {
  timestamp: string;
} & {
  [K in Candidate as `${K}_offChain` | `${K}_onChain`]: number;
};

/**
 * Chart color palette for analytics chart lines (Tailwind palette).
 * Order: [Indigo, Green, Orange]
 */
export const CHART_COLORS: string[] = ["#6366f1", "#10b981", "#f59e42"];
