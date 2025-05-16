import { UseFormReturn } from "react-hook-form";
import { CandidateFormType } from "./schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

interface CandidateStepProps {
  form: UseFormReturn<CandidateFormType>;
  elections: any[];
  onSubmit: (data: CandidateFormType) => void;
  isPending: boolean;
  onBack: () => void;
}

/**
 * CandidateStep renders a form for adding a candidate to an election.
 * @param {CandidateStepProps} props - Props for CandidateStep.
 * @param {UseFormReturn<CandidateFormType>} props.form - Form instance.
 * @param {any[]} props.elections - List of elections.
 * @param {(data: CandidateFormType) => void} props.onSubmit - Submit handler.
 * @param {boolean} props.isPending - Loading state.
 * @param {() => void} props.onBack - Back handler.
 * @returns {JSX.Element} Candidate form.
 */
export const CandidateStep: React.FC<CandidateStepProps> = ({
  form,
  elections,
  onSubmit,
  isPending,
  onBack,
}) => (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <div className="space-y-6">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="candidate-name" className="col-span-1">
          Name
        </Label>
        <Input
          id="candidate-name"
          {...form.register("name")}
          className="col-span-3"
          placeholder="e.g. Jane Doe"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="candidate-bio" className="col-span-1">
          Bio
        </Label>
        <Input
          id="candidate-bio"
          {...form.register("bio")}
          className="col-span-3"
          placeholder="Short bio"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="candidate-party" className="col-span-1">
          Party
        </Label>
        <Input
          id="candidate-party"
          {...form.register("party")}
          className="col-span-3"
          placeholder="e.g. Independent"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="candidate-image" className="col-span-1">
          Avatar URL
        </Label>
        <Input
          id="candidate-image"
          {...form.register("image")}
          className="col-span-3"
          placeholder="Avatar URL"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="col-span-1">Election</Label>
        <Select
          value={form.watch("electionId")}
          onValueChange={(value: any) => form.setValue("electionId", value)}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select Election" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Election</SelectLabel>
              {elections.map((el) => (
                <SelectItem key={el.id} value={el.id}>
                  {el.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="col-span-1">Position</Label>
        <Select
          value={form.watch("positionId")}
          onValueChange={(value: any) => form.setValue("positionId", value)}
          disabled={!form.watch("electionId")}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Position</SelectLabel>
              {elections
                .find((el) => el.id === form.watch("electionId"))
                ?.positions.map((pos: { id: string; name: string }) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between gap-2">
        <Button variant="secondary" type="button" onClick={onBack}>
          Back
        </Button>
        <Button variant="default" type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner className="w-4 h-4 mr-2 text-white" />
              Adding...
            </>
          ) : (
            "Add Candidate"
          )}
        </Button>
      </div>
    </div>
  </form>
);
