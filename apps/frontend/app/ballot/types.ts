export interface Candidate {
  id: string;
  name: string;
  bio: string;
  party: string;
  avatar: string;
  policies?: string[];
}

export type PositionSlug = "president" | "vpresident" | "senator" | "plist";
