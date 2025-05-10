"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateElection } from "./CreateElection";
import { Button } from "../ui/button";

/**
 * DashboardQuickActions displays shortcut buttons for quick actions.
 * @returns {React.JSX.Element} The quick actions card.
 */
export const DashboardQuickActions: React.FC = (): React.JSX.Element => {
  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-medium text-muted-foreground">
          Quick Actions
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 px-4 py-2 text-white rounded hover:bg-primary/90 transition">
                <Plus className="w-4 h-4" /> New Election
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Election</DialogTitle>
              </DialogHeader>
              <CreateElection />
            </DialogContent>
          </Dialog>
          {/* Register Voter Dialog (placeholder) */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 px-4 py-2 text-white rounded hover:bg-primary/90 transition">
                <UserPlus className="w-4 h-4" /> Register Voter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register Voter</DialogTitle>
              </DialogHeader>
              {/* TODO: <RegisterVoter /> */}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
