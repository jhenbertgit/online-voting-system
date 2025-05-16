import { useForm, UseFormReturn } from "react-hook-form";
import {
  ElectionFormType,
  PositionFormType,
  CandidateFormType,
} from "./schema";

export function useElectionForm(): UseFormReturn<ElectionFormType> {
  return useForm<ElectionFormType>({
    defaultValues: {
      name: "",
      description: "",
      dateRange: { from: undefined, to: undefined },
    },
  });
}

export function usePositionForm(): UseFormReturn<PositionFormType> {
  return useForm<PositionFormType>({
    defaultValues: {
      name: "",
      description: "",
      electionId: "",
    },
  });
}

export function useCandidateForm(): UseFormReturn<CandidateFormType> {
  return useForm<CandidateFormType>({
    defaultValues: {
      name: "",
      bio: "",
      party: "",
      image: "",
      positionId: "",
      electionId: "",
    },
  });
}

// Add mutation hooks for election, position, and candidate as needed, using react-query and your business logic.
