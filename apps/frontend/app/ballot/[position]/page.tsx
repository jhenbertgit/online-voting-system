import { notFound } from "next/navigation";
import BallotForm from "../BallotForm";

const positions = [
  { slug: "president", title: "President" },
  { slug: "vpresident", title: "Vice President" },
  { slug: "senator", title: "Senator" },
  { slug: "plist", title: "Party List" },
];

export default function PositionBallotPage({
  params,
}: {
  params: { position: string };
}) {
  const position = positions.find((p) => p.slug === params.position);
  if (!position) return notFound();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">{position.title} Elections</h1>
      <p className="text-muted-foreground mb-6">
        Review candidates and cast your vote
      </p>

      <BallotForm position={position.slug} />
    </div>
  );
}
