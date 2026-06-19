import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins multiple class name strings", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("resolves conditional object syntax", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("flattens nested arrays of classes", () => {
    expect(cn(["a", ["b", "c"]], "d")).toBe("a b c d");
  });

  it("deduplicates conflicting tailwind utilities, keeping the last", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("merges non-conflicting tailwind utilities", () => {
    expect(cn("px-2 py-1", "text-red-500")).toBe("px-2 py-1 text-red-500");
  });

  it("returns an empty string when given no arguments", () => {
    expect(cn()).toBe("");
  });
});
