import { Candidate, PositionSlug } from "@/app/ballot/types";

export function getCandidates(position: PositionSlug): Candidate[] {
  return candidateData[position] || [];
}

// Mock data - replace with actual DB/API calls
const candidateData: Record<PositionSlug, Candidate[]> = {
  president: [
    {
      id: "pres-1",
      name: "Alex Chen",
      bio: "Independent | Tech Entrepreneur",
      party: "Independent",
      avatar: "/avatars/pres-1.jpg",
      policies: ["Education reform", "Blockchain governance"],
    },
    {
      id: "pres-2",
      name: "Maria Rodriguez",
      bio: "Progressive Party | Former Senator",
      party: "Progressive",
      avatar: "/avatars/pres-2.jpg",
      policies: ["Healthcare for all", "Climate action"],
    },
  ],
  vpresident: [
    {
      id: "vp-1",
      name: "Lily Johnson",
      bio: "Democratic Party | Education Advocate",
      party: "Democratic",
      avatar: "/avatars/vp-1.jpg",
      policies: ["Education reform", "Healthcare for all"],
    },
    // ...more vice presidents
  ],
  senator: [
    {
      id: "sen-1",
      name: "Jamal Williams",
      bio: "Urban Development Advocate",
      party: "Unity Party",
      avatar: "/avatars/sen-1.jpg",
      policies: ["Infrastructure", "Job creation"],
    },
    // ...more senators
  ],
  plist: [
    {
      id: "plist-1",
      name: "EPANAW SAMBAYAN",
      bio: "Freedom Advocate",
      party: "Sambayanan",
      avatar: "/avatars/pl-1.jpg",
      policies: ["Gov't reform", "Anti-corruption"],
    },
    // ...more party list
  ],
};
