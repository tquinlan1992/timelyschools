import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildSchedulingExport } from "@/lib/export";
import { SCHOOL_YEAR } from "@/constants";
import { buildRequest } from "../fixtures/students";

describe("buildSchedulingExport", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-27T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns expected export shape", () => {
    const requests = [
      buildRequest({ courseCode: "MTH101", requestType: "priority" }),
      buildRequest({
        id: "req-2",
        courseCode: "AT101",
        requestType: "elective",
        note: "interest",
      }),
    ];
    const result = buildSchedulingExport("S001", requests, 2);

    expect(result).toEqual({
      studentId: "S001",
      schoolYear: SCHOOL_YEAR,
      version: 2,
      exportedAt: "2026-05-27T12:00:00.000Z",
      requests: [
        { courseCode: "MTH101", requestType: "priority" },
        { courseCode: "AT101", requestType: "elective", note: "interest" },
      ],
    });
  });

  it("omits note when not present", () => {
    const result = buildSchedulingExport("S001", [buildRequest()]);
    expect(result.requests[0]).not.toHaveProperty("note");
    expect(result.version).toBe(1);
  });
});
