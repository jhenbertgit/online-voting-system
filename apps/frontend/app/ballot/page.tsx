import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const positions = [
  {
    slug: "president",
    title: "President",
    description: "Vote for President",
    candidates: 5,
    progress: 72,
  },
  {
    slug: "vpresident",
    title: "Vice President",
    description: "Vote for Vice President",
    candidates: 5,
    progress: 72,
  },
  {
    slug: "senator",
    title: "Senator",
    description: "Elect 12 Senators-at-Large",
    candidates: 24,
    progress: 65,
  },
  {
    slug: "plist",
    title: "Party List",
    description: "Elect Party List",
    candidates: 210,
    progress: 45,
  },
];

export default function BallotPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        2025 National and Local Elections
      </h1>
      <p className="text-muted-foreground mb-8">
        Select a position to view candidates and cast your vote
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {positions.map((position) => (
          <Link
            key={position.slug}
            href={`/ballot/${position.slug}`}
            className="group transition-all"
          >
            <Card className="h-full hover:border-primary hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {position.title}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  {position.description}
                </p>
                <div className="flex justify-between text-sm mb-1">
                  <span>{position.candidates} candidates</span>
                  <span>{position.progress}% voted</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${position.progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
