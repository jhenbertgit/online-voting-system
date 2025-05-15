/**
 * Type for a single election event in the activity log.
 */
export interface ElectionEvent {
  eventType: "Election Created" | "Election Opened" | "Election Closed" | "Vote Cast" | "Voter Registered" | "Merkle Root Published" | "Contract Upgraded";
  timestamp: string;
  description: string;
  [key: string]: unknown;
}
