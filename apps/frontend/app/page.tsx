"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Hero from "@/components/shared/Hero";
import Features from "@/components/shared/Features";
import CTA from "@/components/shared/CTA";

/**
 * Home is the main landing page displaying the hero, features, and CTA sections.
 * Handles automatic sign-out and redirects for authenticated users.
 * @returns {JSX.Element} The main landing page or loading state.
 */
export default function Home(): React.JSX.Element {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Redirect to dashboard if user is signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/redirect");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking auth status
  if (!isLoaded || isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show public landing page for non-authenticated users
  return (
    <main className="flex-1">
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}
