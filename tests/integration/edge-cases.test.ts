import { describe, expect, it } from "vitest";
import { EDGE_CASE_STUDENTS } from "@/constants";
import { createStore } from "@/lib/store";

describe("assignment edge cases in seed data", () => {
  const store = createStore();

  it("has one example per scenario with flag and needs attention", async () => {
    const cases = [
      { id: EDGE_CASE_STUDENTS.ell, flag: "ell" as const },
      { id: EDGE_CASE_STUDENTS.retake, flag: "retake" as const },
      { id: EDGE_CASE_STUDENTS.apHeavy, flag: "ap_heavy" as const },
      { id: EDGE_CASE_STUDENTS.transfer, flag: "transfer" as const },
    ];

    for (const { id, flag } of cases) {
      const student = await store.getStudent(id);
      expect(student, `missing student ${id}`).not.toBeNull();
      expect(student!.flags).toContain(flag);
      expect(student!.needsAttention).toBe(true);
    }
  });

  it("has a no-requests example (S005)", async () => {
    const student = await store.getStudent(EDGE_CASE_STUDENTS.noRequests);
    expect(student!.flags).toContain("no_requests");
    expect(student!.requestCounts.total).toBe(0);
    expect(student!.needsAttention).toBe(true);
  });
});
