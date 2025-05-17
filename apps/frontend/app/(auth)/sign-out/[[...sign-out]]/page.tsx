"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * SignOutPage handles the user sign-out process.
 * It signs the user out and redirects to the home page.
 */
export default function SignOutPage() {
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Sign out the user and redirect to home
    const handleSignOut = async () => {
      try {
        await signOut();
        // Redirect to home after successful sign out
        router.push("/");
      } catch (error) {
        console.error("Error signing out:", error);
        // Still redirect to home even if there's an error
        router.push("/");
      }
    };

    handleSignOut();
  }, [signOut, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    </div>
  );
}
