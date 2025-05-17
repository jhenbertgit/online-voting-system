"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * RedirectPage checks the user's role and redirects accordingly.
 * Admins go to /admin, all others go to /ballot.
 */
export default function RedirectPage(): React.JSX.Element {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    const role = user?.publicMetadata.role;
    if (role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/ballot");
    }
  }, [user, isLoaded, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          <span className="sr-only">Redirecting...</span>
          <span aria-hidden="true">Redirecting...</span>
        </p>
      </div>
    </div>
  );
}
