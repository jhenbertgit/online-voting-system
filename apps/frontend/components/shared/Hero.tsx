"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { JSX } from "react";

/**
 * Hero displays the landing page hero section with call-to-action for voting.
 * @returns {JSX.Element} The hero section.
 */
export default function Hero(): JSX.Element {
  const router = useRouter();

  return (
    <section className="py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Secure Online Voting Made Simple
          </h1>
          <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Cast your vote from anywhere with blockchain-verified security and
            real-time results.
          </p>
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={() => router.push("/ballot")}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Vote Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/sign-up")}
              className="cursor-pointer"
            >
              Register
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
