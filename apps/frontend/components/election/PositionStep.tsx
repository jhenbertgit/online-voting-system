import { UseFormReturn } from "react-hook-form";
import { PositionFormType } from "./schema";
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

interface PositionStepProps {
  form: UseFormReturn<PositionFormType>;
  elections: any[];
  electionsLoading: boolean;
  onSubmit: (data: PositionFormType) => void;
  isPending: boolean;
  onBack: () => void;
}

/**
 * PositionStep renders a form for adding a position to an election.
 * @param {PositionStepProps} props - Props for PositionStep.
 * @param {UseFormReturn<PositionFormType>} props.form - Form instance.
 * @param {any[]} props.elections - List of elections.
 * @param {boolean} props.electionsLoading - Loading state.
 * @param {(data: PositionFormType) => void} props.onSubmit - Submit handler.
 * @param {boolean} props.isPending - Loading state.
 * @param {() => void} props.onBack - Back handler.
 * @returns {JSX.Element} Position form.
 */
export const PositionStep: React.FC<PositionStepProps> = ({
  form,
  elections,
  electionsLoading,
  onSubmit,
  isPending,
  onBack,
}) => (
  <form
    onSubmit={form.handleSubmit((data) =>
      onSubmit({ ...data, name: data.name.toLowerCase() })
    )}
  >
    <div className="space-y-6">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="position-name" className="col-span-1">
          Position Name
        </Label>
        <Input
          id="position-name"
          {...form.register("name")}
          className="col-span-3"
          placeholder="e.g. President"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="position-description" className="col-span-1">
          Description
        </Label>
        <Input
          id="position-description"
          {...form.register("description")}
          className="col-span-3"
          placeholder="e.g. The highest office in the election."
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="position-election" className="col-span-1">
          Election
        </Label>
        <Select
          value={form.watch("electionId")}
          onValueChange={(value: any) => form.setValue("electionId", value)}
          disabled={electionsLoading}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select election" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Election</SelectLabel>
              {elections.map((e: any) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
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
            "Add Position"
          )}
        </Button>
      </div>
    </div>
  </form>
);
