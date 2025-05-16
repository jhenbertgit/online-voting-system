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
import { CreateElection } from "@/components/election";
import { Button } from "@/components/ui/button";

/**
 * QuickActions displays shortcut buttons for quick actions in the dashboard.
 * @returns {React.JSX.Element} The quick actions card.
 */
export const QuickActions: React.FC = (): React.JSX.Element => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-medium text-muted-foreground">
          Quick Actions
        </div>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Election
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Election</DialogTitle>
            </DialogHeader>
            <CreateElection onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
        {/* Register Voter Dialog (placeholder) */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
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
      </CardContent>
    </Card>
  );
};
