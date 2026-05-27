import { describe, expect, it } from "vitest";
import { paginate, parsePageParam, parsePageSizeParam } from "@/lib/pagination";

describe("paginate", () => {
  it("returns a slice and metadata", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = paginate(items, 2, 3);
    expect(result.items).toEqual([4, 5, 6]);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(3);
    expect(result.total).toBe(10);
    expect(result.totalPages).toBe(4);
  });

  it("clamps page when out of range", () => {
    const result = paginate([1, 2], 99, 10);
    expect(result.page).toBe(1);
    expect(result.items).toEqual([1, 2]);
  });
});

describe("parsePageParam", () => {
  it("defaults invalid values to 1", () => {
    expect(parsePageParam(null)).toBe(1);
    expect(parsePageParam("0")).toBe(1);
  });
});

describe("parsePageSizeParam", () => {
  it("accepts allowed page sizes", () => {
    expect(parsePageSizeParam("25")).toBe(25);
  });

  it("falls back for invalid sizes", () => {
    expect(parsePageSizeParam("99")).toBe(10);
  });
});
