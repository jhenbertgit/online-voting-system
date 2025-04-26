import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Candidate } from "database/src/client/client";
import { Check } from "lucide-react";

export default function BallotItem({ candidate }: { candidate: Candidate }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors group">
      <div className="flex items-center h-5 mt-1">
        <RadioGroupItem
          value={candidate.id}
          id={`candidate-${candidate.id}`}
          className="peer sr-only"
        />
        <div className="h-4 w-4 rounded-full border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground flex items-center justify-center">
          <Check className="h-3 w-3 opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity" />
        </div>
      </div>

      <Label
        htmlFor={`candidate-${candidate.id}`}
        className="flex flex-1 items-start gap-4 cursor-pointer"
      >
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage
            src={candidate.avatar || ""}
            alt={`${candidate.name}'s profile picture`}
          />
          <AvatarFallback className="bg-muted">
            {candidate.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <h3 className="font-medium text-base">{candidate.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {candidate.party}
            </span>
          </div>

          {candidate.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {candidate.bio}
            </p>
          )}
        </div>
      </Label>
    </div>
  );
}
