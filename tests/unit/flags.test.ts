import { describe, expect, it } from "vitest";
import {
  computeRequestCounts,
  computeStudentFlags,
  countApCourses,
  sortStudents,
} from "@/lib/flags";
import { EDGE_CASE_STUDENTS } from "@/constants";
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
  it("flags S002 as ELL from profile", () => {
    const student = buildStudent({
      id: EDGE_CASE_STUDENTS.ell,
      profile: "English Language Learner support needed.",
    });
    const { flags, needsAttention } = computeStudentFlags(student, [buildRequest()], courses);
    expect(flags).toContain("ell");
    expect(needsAttention).toBe(true);
  });

  it("flags S003 as retake from profile", () => {
    const student = buildStudent({
      id: EDGE_CASE_STUDENTS.retake,
      profile: "Failed MTH101 last year. Must retake before advancing.",
    });
    const { flags, needsAttention } = computeStudentFlags(student, [buildRequest()], courses);
    expect(flags).toContain("retake");
    expect(needsAttention).toBe(true);
  });

  it("flags S009 as ap_heavy with 4+ AP courses", () => {
    const student = buildStudent({ id: EDGE_CASE_STUDENTS.apHeavy });
    const requests = [
      buildRequest({ courseCode: "MTH401" }),
      buildRequest({ courseCode: "ENG401", id: "r2" }),
      buildRequest({ courseCode: "SS401", id: "r3" }),
      buildRequest({ courseCode: "SCI401", id: "r4" }),
    ];
    const { flags, needsAttention } = computeStudentFlags(student, requests, courses);
    expect(flags).toContain("ap_heavy");
    expect(needsAttention).toBe(true);
  });

  it("flags S010 as transfer with credit pending", () => {
    const student = buildStudent({
      id: EDGE_CASE_STUDENTS.transfer,
      enrollmentStatus: "incoming",
      profile: "Transferred mid-year. Credit evaluation pending.",
    });
    const { flags, needsAttention } = computeStudentFlags(student, [buildRequest()], courses);
    expect(flags).toContain("transfer");
    expect(flags).toContain("credit_pending");
    expect(needsAttention).toBe(true);
  });

  it("flags S005 as no_requests when request list is empty", () => {
    const student = buildStudent({ id: EDGE_CASE_STUDENTS.noRequests });
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
