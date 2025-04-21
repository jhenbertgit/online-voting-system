import Hero from "@/components/shared/Hero";
import Features from "@/components/shared/Features";
import CTA from "@/components/shared/CTA";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}
