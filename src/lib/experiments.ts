import type { Experiment } from "@/lib/ab-testing";

/**
 * Central registry of active experiments.
 *
 * Declaring experiments here (rather than inline) keeps variant ids and
 * weights in one place so they are easy to audit, tweak, or disable.
 */
export const experiments = {
  /** Copy test on the primary "book a demo" call to action. */
  demoCtaCopy: {
    id: "demo-cta-copy",
    variants: [
      { id: "control" }, // "Request Live Demo"
      { id: "urgent" }, // "Book Your Free Demo"
    ],
  },
} satisfies Record<string, Experiment>;
