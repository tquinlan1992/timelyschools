import { describe, expect, it } from "vitest";
import { createStore } from "@/lib/store";
import { SCHOOL_YEAR } from "@/constants";

describe("InMemoryStore", () => {
  it("sorts students with needsAttention first", async () => {
    const store = createStore();
    const students = await store.getStudents();
    const firstNeedsAttention = students.findIndex((s) => s.needsAttention);
    const firstNoAttention = students.findIndex((s) => !s.needsAttention);
    if (firstNeedsAttention >= 0 && firstNoAttention >= 0) {
      expect(firstNeedsAttention).toBeLessThan(firstNoAttention);
    }
    expect(students.some((s) => s.id === "S003" && s.needsAttention)).toBe(true);
  });

  it("filters needs_attention students", async () => {
    const store = createStore();
    const students = await store.getStudents({ filter: "needs_attention" });
    expect(students.every((s) => s.needsAttention)).toBe(true);
    expect(students.some((s) => s.id === "S010")).toBe(true);
  });

  it("searches students by name", async () => {
    const store = createStore();
    const students = await store.getStudents({ search: "nina" });
    expect(students).toHaveLength(1);
    expect(students[0].name).toBe("Nina Torres");
  });

  it("adds and enriches a request", async () => {
    const store = createStore();
    const created = await store.addRequest({
      studentId: "S001",
      courseCode: "AT102",
      requestType: "elective",
      schoolYear: SCHOOL_YEAR,
    });
    expect(created.courseName).toBe("Visual Arts I");
    expect(created.department).toBe("Arts & Tech");
  });

  it("rejects duplicate course for same student", async () => {
    const store = createStore();
    await expect(
      store.addRequest({
        studentId: "S001",
        courseCode: "MTH101",
        requestType: "priority",
        schoolYear: SCHOOL_YEAR,
      })
    ).rejects.toMatchObject({ status: 409 });
  });

  it("rejects unknown course code", async () => {
    const store = createStore();
    await expect(
      store.addRequest({
        studentId: "S001",
        courseCode: "FAKE999",
        requestType: "priority",
        schoolYear: SCHOOL_YEAR,
      })
    ).rejects.toThrow("Course not found");
  });

  it("updates request type", async () => {
    const store = createStore();
    const student = await store.getStudent("S001");
    const request = student!.requests[0];
    const updated = await store.updateRequest(request.id, { requestType: "elective" });
    expect(updated.requestType).toBe("elective");
  });

  it("deletes request and throws 404 for missing", async () => {
    const store = createStore();
    const student = await store.getStudent("S001");
    const requestId = student!.requests[0].id;
    await store.deleteRequest(requestId);
    const after = await store.getStudent("S001");
    expect(after!.requests.find((r) => r.id === requestId)).toBeUndefined();
    await expect(store.deleteRequest(requestId)).rejects.toMatchObject({ status: 404 });
  });

  it("sets no_requests flag after deleting all requests", async () => {
    const store = createStore();
    const student = await store.getStudent("S001");
    for (const r of [...student!.requests]) {
      await store.deleteRequest(r.id);
    }
    const updated = await store.getStudent("S001");
    expect(updated!.flags).toContain("no_requests");
    expect(updated!.needsAttention).toBe(true);
  });
});
