"use client";
import type { JSX } from "react";
import Hero from "@/components/shared/Hero";
import Features from "@/components/shared/Features";
import CTA from "@/components/shared/CTA";

/**
 * Home is the main landing page displaying the hero, features, and CTA sections.
 * @returns {JSX.Element} The main landing page.
 */
export default function Home(): JSX.Element {
  return (
    <main className="flex-1">
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}
