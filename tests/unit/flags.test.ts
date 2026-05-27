import { describe, expect, it } from "vitest";
import {
  computeRequestCounts,
  computeStudentFlags,
  countApCourses,
  sortStudents,
} from "@/lib/flags";
import { buildCourse, buildCourseMap } from "../fixtures/courses";
import { buildRequest, buildStudent } from "../fixtures/students";

const courses = buildCourseMap([
  buildCourse({ code: "MTH401", name: "AP Calculus AB" }),
  buildCourse({ code: "ENG401", name: "AP English Language" }),
  buildCourse({ code: "SS401", name: "AP U.S. History" }),
  buildCourse({ code: "SCI401", name: "AP Biology" }),
  buildCourse({ code: "AT301", name: "AP Computer Science A" }),
  buildCourse({ code: "MTH101", name: "Algebra I" }),
]);

describe("computeRequestCounts", () => {
  it("counts priority and elective requests", () => {
    const requests = [
      buildRequest({ requestType: "priority" }),
      buildRequest({ requestType: "priority", id: "req-2", courseCode: "ENG101" }),
      buildRequest({ requestType: "elective", id: "req-3", courseCode: "AT101" }),
    ];
    expect(computeRequestCounts(requests)).toEqual({
      total: 3,
      priority: 2,
      elective: 1,
    });
  });
});

describe("computeStudentFlags", () => {
  it("flags S002 as ELL", () => {
    const student = buildStudent({ id: "S002" });
    const { flags } = computeStudentFlags(student, [buildRequest()], courses);
    expect(flags).toContain("ell");
  });

  it("flags S003 as retake and needs attention", () => {
    const student = buildStudent({ id: "S003" });
    const { flags, needsAttention } = computeStudentFlags(student, [buildRequest()], courses);
    expect(flags).toContain("retake");
    expect(needsAttention).toBe(true);
  });

  it("flags S010 as transfer with credit pending", () => {
    const student = buildStudent({ id: "S010", enrollmentStatus: "incoming" });
    const { flags, needsAttention } = computeStudentFlags(student, [buildRequest()], courses);
    expect(flags).toContain("transfer");
    expect(flags).toContain("credit_pending");
    expect(needsAttention).toBe(true);
  });

  it("flags ap_heavy when 4+ AP courses", () => {
    const student = buildStudent({ id: "S009" });
    const requests = [
      buildRequest({ courseCode: "MTH401" }),
      buildRequest({ courseCode: "ENG401", id: "r2" }),
      buildRequest({ courseCode: "SS401", id: "r3" }),
      buildRequest({ courseCode: "SCI401", id: "r4" }),
    ];
    const { flags } = computeStudentFlags(student, requests, courses);
    expect(flags).toContain("ap_heavy");
  });

  it("flags no_requests and needs attention when empty", () => {
    const student = buildStudent({ id: "S001" });
    const { flags, needsAttention } = computeStudentFlags(student, [], courses);
    expect(flags).toContain("no_requests");
    expect(needsAttention).toBe(true);
  });

  it("needs attention when note contains TBD", () => {
    const student = buildStudent({ id: "S001" });
    const requests = [buildRequest({ note: "TBD pending transcript review" })];
    const { needsAttention } = computeStudentFlags(student, requests, courses);
    expect(needsAttention).toBe(true);
  });
});

describe("countApCourses", () => {
  it("counts AP courses by code pattern", () => {
    const requests = [
      buildRequest({ courseCode: "MTH401" }),
      buildRequest({ courseCode: "MTH101", id: "r2" }),
    ];
    expect(countApCourses(requests, courses)).toBe(1);
  });
});

describe("sortStudents", () => {
  it("sorts needsAttention first, then grade, then name", () => {
    const students = [
      { id: "a", name: "Zoe", grade: 9, needsAttention: false },
      { id: "b", name: "Amy", grade: 10, needsAttention: true },
      { id: "c", name: "Bob", grade: 9, needsAttention: true },
    ];
    const sorted = sortStudents(students);
    expect(sorted.map((s) => s.id)).toEqual(["c", "b", "a"]);
  });
});
