# A/B Testing Harness

A small, dependency-free harness for running client-side experiments:
deterministic variant assignment, sticky bucketing, and a pluggable event
sink for exposure and conversion tracking.

## Files

| File | Purpose |
| --- | --- |
| `src/lib/ab-testing.ts` | Core: bucketing, persistence, event sink. |
| `src/hooks/use-experiment.ts` | React hook (`useExperiment`). |
| `src/lib/experiments.ts` | Central registry of active experiments. |

## How assignment works

`assignVariant` resolves a variant in this order:

1. **Query override** — `?ab_<experimentId>=<variantId>` forces a variant
   (handy for QA and screenshots). Not persisted.
2. **Sticky assignment** — a previously bucketed visitor keeps their variant
   (persisted in `localStorage`).
3. **Deterministic bucketing** — a stable anonymous `subjectId` is hashed with
   the experiment id (FNV-1a) and mapped onto the weighted variant ranges, so a
   given visitor always lands in the same bucket without a network round-trip.

Assignment is safe during SSR / when storage is unavailable — it degrades to a
non-persistent split and never throws.

## Usage

```tsx
import { useExperiment } from "@/hooks/use-experiment";
import { experiments } from "@/lib/experiments";

function DemoCta() {
  const demo = useExperiment(experiments.demoCtaCopy);
  const label = demo.variant === "urgent" ? "Book Your Free Demo" : "Request Live Demo";

  return (
    <button onClick={() => demo.track()}>
      {label}
    </button>
  );
}
```

`useExperiment` fires a single `expose` event on mount and returns a `track`
helper you call on conversion. Weighted splits are supported via the optional
`weight` on each variant (defaults to an equal split).

## Wiring up analytics

By default events are pushed to `window.dataLayer` when present, otherwise
logged in development. To forward events to your own analytics, register a sink
once at startup:

```ts
import { setAbEventSink } from "@/lib/ab-testing";

setAbEventSink((event) => {
  // event: { type, experimentId, variantId, subjectId, timestamp, meta }
  myAnalytics.track(`ab_${event.type}`, event);
});
```

## Adding an experiment

Add an entry to `src/lib/experiments.ts`:

```ts
export const experiments = {
  demoCtaCopy: {
    id: "demo-cta-copy",
    variants: [{ id: "control" }, { id: "urgent" }],
  },
} satisfies Record<string, Experiment>;
```

Set `enabled: false` to hold everyone on the control variant without removing
the code. Use `resetAssignment(id)` to clear a sticky bucket during testing.
