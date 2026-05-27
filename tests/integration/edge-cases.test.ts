import { describe, expect, it } from "vitest";
import { EDGE_CASE_STUDENTS } from "@/constants";
import { createStore } from "@/lib/store";

describe("Appendix B edge cases in seed data", () => {
  const store = createStore();

  it("has one example per assignment scenario with flag and needs attention", async () => {
    const cases = [
      { id: EDGE_CASE_STUDENTS.ell, flag: "ell" as const, name: "Mei Chen" },
      { id: EDGE_CASE_STUDENTS.retake, flag: "retake" as const, name: "Jordan Williams" },
      { id: EDGE_CASE_STUDENTS.apHeavy, flag: "ap_heavy" as const, name: "Liam O'Brien" },
      { id: EDGE_CASE_STUDENTS.transfer, flag: "transfer" as const, name: "Nina Torres" },
    ];

    for (const { id, flag, name } of cases) {
      const student = await store.getStudent(id);
      expect(student, `missing student ${id}`).not.toBeNull();
      expect(student!.name).toBe(name);
      expect(student!.flags).toContain(flag);
      expect(student!.needsAttention).toBe(true);
    }
  });

  it("S010 also has credit pending and TBD placeholder requests", async () => {
    const student = await store.getStudent(EDGE_CASE_STUDENTS.transfer);
    expect(student!.flags).toContain("credit_pending");
    expect(student!.requests.every((r) => r.note?.toLowerCase().includes("tbd"))).toBe(true);
  });

  it("does not seed no_requests on roster students", async () => {
    const students = await store.getStudents();
    expect(students.every((s) => !s.flags.includes("no_requests"))).toBe(true);
  });
});
