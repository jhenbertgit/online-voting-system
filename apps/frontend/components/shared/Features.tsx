import { Card } from "@/components/ui/card";
import type { JSX } from "react";

const features = [
  {
    title: "End-to-End Encryption",
    description: "Military-grade security for your vote anonymity",
    icon: "🔒",
  },
  {
    title: "Real-Time Results",
    description: "Live updates with verifiable audit trails",
    icon: "📊",
  },
  {
    title: "Mobile-Friendly",
    description: "Vote seamlessly on any device",
    icon: "📱",
  },
];

/**
 * Features displays key benefits and features of the voting system.
 * @returns {JSX.Element} The features section.
 */
export default function Features(): JSX.Element {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Trust Our System?
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
