/**
 * Lightweight, dependency-free A/B testing harness.
 *
 * Provides deterministic variant assignment (stable per-visitor via a
 * persisted anonymous id), weighted buckets, assignment overrides, and a
 * pluggable event sink for exposure/conversion tracking.
 *
 * Everything is framework-agnostic; see `use-experiment` for the React glue.
 */

export interface Variant {
  /** Stable identifier for the variant, e.g. "control" | "treatment". */
  id: string;
  /**
   * Relative weight used for bucketing. Defaults to 1 (equal split).
   * Weights do not need to sum to any particular number.
   */
  weight?: number;
}

export interface Experiment {
  /** Stable identifier for the experiment. */
  id: string;
  /** Two or more variants to split traffic across. */
  variants: Variant[];
  /**
   * When false the experiment is not evaluated and the first variant
   * (treated as the control) is always returned. Defaults to true.
   */
  enabled?: boolean;
}

export type AbEventType = "assign" | "expose" | "convert";

export interface AbEvent {
  type: AbEventType;
  experimentId: string;
  variantId: string;
  /** Anonymous, per-browser visitor id. */
  subjectId: string;
  /** Epoch milliseconds when the event was produced. */
  timestamp: number;
  /** Optional free-form metadata (e.g. conversion value). */
  meta?: Record<string, unknown>;
}

export type AbEventSink = (event: AbEvent) => void;

const SUBJECT_STORAGE_KEY = "ab:subject";
const ASSIGNMENT_STORAGE_KEY = "ab:assignments";
const OVERRIDE_QUERY_PREFIX = "ab_";

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be full or blocked; assignment simply won't persist */
  }
}

/** Small, fast, non-cryptographic string hash (FNV-1a, 32-bit). */
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    // 32-bit FNV prime multiply via shifts to stay in 32-bit range
    hash = Math.imul(hash, 0x01000193);
  }
  // force unsigned
  return hash >>> 0;
}

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Returns a stable anonymous id for the current visitor, creating and
 * persisting one on first call.
 */
export function getSubjectId(): string {
  const existing = readJson<string | null>(SUBJECT_STORAGE_KEY, null);
  if (existing && typeof existing === "string") return existing;
  const id = randomId();
  writeJson(SUBJECT_STORAGE_KEY, id);
  return id;
}

function readOverride(experimentId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(`${OVERRIDE_QUERY_PREFIX}${experimentId}`);
  } catch {
    return null;
  }
}

function readStoredAssignment(experimentId: string): string | null {
  const map = readJson<Record<string, string>>(ASSIGNMENT_STORAGE_KEY, {});
  return map[experimentId] ?? null;
}

function storeAssignment(experimentId: string, variantId: string): void {
  const map = readJson<Record<string, string>>(ASSIGNMENT_STORAGE_KEY, {});
  if (map[experimentId] === variantId) return;
  map[experimentId] = variantId;
  writeJson(ASSIGNMENT_STORAGE_KEY, map);
}

/** Picks a variant deterministically from a hashed bucket in [0, 1). */
function pickWeighted(variants: Variant[], bucket: number): Variant {
  const total = variants.reduce((sum, v) => sum + (v.weight ?? 1), 0);
  const target = bucket * total;
  let cursor = 0;
  for (const variant of variants) {
    cursor += variant.weight ?? 1;
    if (target < cursor) return variant;
  }
  return variants[variants.length - 1];
}

let sink: AbEventSink = defaultSink;

function defaultSink(event: AbEvent): void {
  if (typeof window === "undefined") return;
  // Prefer a global analytics dataLayer if present, else a debug log.
  const layer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(layer)) {
    layer.push({ event: `ab_${event.type}`, ...event });
    return;
  }
  if (import.meta.env?.DEV) {
    console.debug("[ab-testing]", event);
  }
}

/** Replaces the global event sink (e.g. to forward to your analytics). */
export function setAbEventSink(next: AbEventSink): void {
  sink = next;
}

/** Emits an A/B event through the configured sink. */
export function trackAbEvent(
  type: AbEventType,
  experimentId: string,
  variantId: string,
  meta?: Record<string, unknown>,
): void {
  sink({
    type,
    experimentId,
    variantId,
    subjectId: getSubjectId(),
    timestamp: Date.now(),
    meta,
  });
}

export interface Assignment {
  experimentId: string;
  variantId: string;
  /** True when the visitor was already bucketed on a previous visit. */
  sticky: boolean;
}

/**
 * Assigns (or recalls) a variant for the given experiment.
 *
 * Resolution order:
 *   1. `?ab_<experimentId>=<variantId>` query override (for QA / forcing).
 *   2. A previously persisted assignment (stickiness across visits).
 *   3. Deterministic weighted bucketing from hash(subjectId + experimentId).
 *
 * Emits an "assign" event only the first time a subject is bucketed.
 */
export function assignVariant(experiment: Experiment): Assignment {
  const { id: experimentId, variants } = experiment;
  if (!variants || variants.length === 0) {
    throw new Error(`Experiment "${experimentId}" has no variants`);
  }

  if (experiment.enabled === false) {
    return { experimentId, variantId: variants[0].id, sticky: false };
  }

  const override = readOverride(experimentId);
  if (override && variants.some((v) => v.id === override)) {
    return { experimentId, variantId: override, sticky: false };
  }

  const stored = readStoredAssignment(experimentId);
  if (stored && variants.some((v) => v.id === stored)) {
    return { experimentId, variantId: stored, sticky: true };
  }

  const subjectId = getSubjectId();
  const bucket = hashString(`${subjectId}:${experimentId}`) / 0xffffffff;
  const variant = pickWeighted(variants, bucket);
  storeAssignment(experimentId, variant.id);
  trackAbEvent("assign", experimentId, variant.id);
  return { experimentId, variantId: variant.id, sticky: false };
}

/** Clears the persisted assignment for one experiment (or all). */
export function resetAssignment(experimentId?: string): void {
  if (!experimentId) {
    if (hasStorage()) window.localStorage.removeItem(ASSIGNMENT_STORAGE_KEY);
    return;
  }
  const map = readJson<Record<string, string>>(ASSIGNMENT_STORAGE_KEY, {});
  if (experimentId in map) {
    delete map[experimentId];
    writeJson(ASSIGNMENT_STORAGE_KEY, map);
  }
}

// Exposed for unit testing of the bucketing function.
export const __internal = { hashString, pickWeighted };
