import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CTA from "@/components/CTA";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}
