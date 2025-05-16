import { ReactNode } from "react";
import { Election, Candidate, Position } from "database/src/client";

export interface StatCardData {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
}

export interface ElectionType extends Election {
  candidates: Candidate[];
  positions: Position[];
}
