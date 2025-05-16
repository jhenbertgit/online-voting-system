import { Controller, UseFormReturn } from "react-hook-form";
import { ElectionFormType } from "./schema";
import { DatePickerWithRange } from "../shared/DatePickerWithRange";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ElectionStepProps {
  form: UseFormReturn<ElectionFormType>;
  onSubmit: (data: ElectionFormType) => void;
  isPending: boolean;
  onCancel: () => void;
}

/**
 * ElectionStep renders a form for creating an election.
 * @param {ElectionStepProps} props - Props for ElectionStep.
 * @param {UseFormReturn<ElectionFormType>} props.form - Form instance.
 * @param {(data: ElectionFormType) => void} props.onSubmit - Submit handler.
 * @param {boolean} props.isPending - Loading state.
 * @param {() => void} props.onCancel - Cancel handler.
 * @returns {JSX.Element} Election form.
 */
export const ElectionStep: React.FC<ElectionStepProps> = ({
  form,
  onSubmit,
  isPending,
  onCancel,
}) => (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <div className="space-y-6">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          {...form.register("name")}
          className="col-span-3"
          placeholder="Election name"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Description
        </Label>
        <Input
          id="description"
          {...form.register("description")}
          className="col-span-3"
          placeholder="Election description"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="col-span-1">Election Period</Label>
        <div className="flex gap-4 col-span-3">
          <Controller
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <DatePickerWithRange
                className="w-full"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="default" type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner className="w-4 h-4 mr-2 text-white" />
              Creating...
            </>
          ) : (
            "Create Election"
          )}
        </Button>
      </div>
    </div>
  </form>
);
