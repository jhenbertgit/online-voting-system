"use client";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

/**
 * CTA displays a call-to-action section for voting or registration.
 * @returns {JSX.Element} The CTA section.
 */
export default function CTA(): JSX.Element {
  const router = useRouter();

  return (
    <section className="py-12 md:py-24 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container px-4 md:px-6">
        <Card className="p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400 mb-8">
            Join thousands of voters using our secure platform. No delays, no
            biases—just transparent results.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() => router.push("/ballot")}
              className="bg-blue-600 hover:bg-blue-700 hover:animate-pulse cursor-pointer"
            >
              Vote Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/how-it-works")}
              className="cursor-pointer"
            >
              How It Works
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
