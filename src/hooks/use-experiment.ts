import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  assignVariant,
  trackAbEvent,
  type Experiment,
  type Variant,
} from "@/lib/ab-testing";

export interface UseExperimentResult {
  /** The variant id the current visitor is bucketed into. */
  variant: string;
  /** True when the visitor was bucketed on a previous visit. */
  sticky: boolean;
  /** True when `variant` equals the first (control) variant. */
  isControl: boolean;
  /**
   * Records a conversion for this experiment/variant. Call it when the
   * behaviour you are optimising for happens (e.g. a button click).
   */
  track: (meta?: Record<string, unknown>) => void;
}

/**
 * React binding for the A/B harness.
 *
 * Buckets the visitor once (assignment is deterministic and sticky), fires a
 * single "expose" event on mount, and returns the variant plus a `track`
 * helper for conversions.
 *
 * @example
 *   const { variant, track } = useExperiment({
 *     id: "cta-copy",
 *     variants: [{ id: "control" }, { id: "urgent" }],
 *   });
 *   return <Button onClick={() => track()}>{variant === "urgent" ? "Start now" : "Get started"}</Button>;
 */
export function useExperiment(experiment: Experiment): UseExperimentResult {
  // Memoise assignment so re-renders never re-bucket the visitor.
  const assignment = useMemo(
    () => assignVariant(experiment),
    // Assignment depends only on the experiment identity + shape.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [experiment.id, experiment.enabled, serializeVariants(experiment.variants)],
  );

  const exposedRef = useRef(false);
  useEffect(() => {
    if (exposedRef.current) return;
    exposedRef.current = true;
    trackAbEvent("expose", assignment.experimentId, assignment.variantId);
  }, [assignment.experimentId, assignment.variantId]);

  const track = useCallback(
    (meta?: Record<string, unknown>) => {
      trackAbEvent(
        "convert",
        assignment.experimentId,
        assignment.variantId,
        meta,
      );
    },
    [assignment.experimentId, assignment.variantId],
  );

  const controlId = experiment.variants[0]?.id;
  return {
    variant: assignment.variantId,
    sticky: assignment.sticky,
    isControl: assignment.variantId === controlId,
    track,
  };
}

function serializeVariants(variants: Variant[]): string {
  return variants.map((v) => `${v.id}:${v.weight ?? 1}`).join("|");
}
