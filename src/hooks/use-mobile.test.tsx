import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

type ChangeHandler = () => void;

function stubViewport(width: number) {
  const listeners = new Set<ChangeHandler>();
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: window.innerWidth < 768,
      media: query,
      addEventListener: (_: string, cb: ChangeHandler) => listeners.add(cb),
      removeEventListener: (_: string, cb: ChangeHandler) => listeners.delete(cb),
      dispatchEvent: () => true,
    })),
  );
  return {
    resize(next: number) {
      (window as unknown as { innerWidth: number }).innerWidth = next;
      listeners.forEach((cb) => cb());
    },
  };
}

describe("useIsMobile", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports true for viewports narrower than the breakpoint", () => {
    stubViewport(500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("reports false for viewports at or above the breakpoint", () => {
    stubViewport(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("updates when the viewport crosses the breakpoint", () => {
    const viewport = stubViewport(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => viewport.resize(400));
    expect(result.current).toBe(true);
  });
});
