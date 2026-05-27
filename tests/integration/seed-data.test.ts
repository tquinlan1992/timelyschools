import { describe, expect, it } from "vitest";
import coursesData from "@/data/courses.json";
import studentsData from "@/data/students.json";
import initialRequestsData from "@/data/initial-requests.json";
import { loadCourses, loadInitialRequests, loadStudents } from "@/lib/repository/seed-data";
import type { CourseRequest } from "@/types";

/** Expected requests from Appendix B (course code + type; notes optional). */
const EXPECTED_REQUESTS: Record<
  string,
  Array<{ courseCode: string; requestType: "priority" | "elective" }>
> = {
  S001: [
    { courseCode: "MTH101", requestType: "priority" },
    { courseCode: "ENG101", requestType: "priority" },
    { courseCode: "SS101", requestType: "priority" },
    { courseCode: "SCI101", requestType: "priority" },
    { courseCode: "AT101", requestType: "elective" },
  ],
  S002: [
    { courseCode: "MTH101", requestType: "priority" },
    { courseCode: "ENG101", requestType: "priority" },
    { courseCode: "ENG102", requestType: "priority" },
    { courseCode: "SS101", requestType: "priority" },
    { courseCode: "SCI101", requestType: "priority" },
  ],
  S003: [
    { courseCode: "MTH101", requestType: "priority" },
    { courseCode: "ENG201", requestType: "priority" },
    { courseCode: "SS201", requestType: "priority" },
    { courseCode: "SCI201", requestType: "priority" },
    { courseCode: "AT201", requestType: "elective" },
  ],
  S004: [
    { courseCode: "MTH201", requestType: "priority" },
    { courseCode: "ENG201", requestType: "priority" },
    { courseCode: "SS201", requestType: "priority" },
    { courseCode: "SCI201", requestType: "priority" },
    { courseCode: "AT301", requestType: "elective" },
  ],
  S005: [
    { courseCode: "MTH202", requestType: "priority" },
    { courseCode: "ENG301", requestType: "priority" },
    { courseCode: "SS301", requestType: "priority" },
    { courseCode: "SCI301", requestType: "priority" },
    { courseCode: "AT302", requestType: "elective" },
    { courseCode: "AT303", requestType: "elective" },
  ],
  S006: [
    { courseCode: "MTH401", requestType: "priority" },
    { courseCode: "ENG401", requestType: "priority" },
    { courseCode: "SS401", requestType: "priority" },
    { courseCode: "SCI401", requestType: "priority" },
    { courseCode: "AT301", requestType: "elective" },
  ],
  S007: [
    { courseCode: "MTH202", requestType: "priority" },
    { courseCode: "ENG301", requestType: "priority" },
    { courseCode: "SS301", requestType: "priority" },
    { courseCode: "SCI301", requestType: "priority" },
    { courseCode: "SS302", requestType: "elective" },
  ],
  S008: [
    { courseCode: "MTH302", requestType: "priority" },
    { courseCode: "ENG401", requestType: "priority" },
    { courseCode: "SS402", requestType: "priority" },
    { courseCode: "SCI403", requestType: "elective" },
    { courseCode: "SS302", requestType: "elective" },
    { courseCode: "SS403", requestType: "elective" },
  ],
  S009: [
    { courseCode: "MTH401", requestType: "priority" },
    { courseCode: "ENG402", requestType: "priority" },
    { courseCode: "SS402", requestType: "priority" },
    { courseCode: "SCI402", requestType: "priority" },
    { courseCode: "AT301", requestType: "elective" },
  ],
  S010: [
    { courseCode: "ENG403", requestType: "priority" },
    { courseCode: "SCI403", requestType: "elective" },
    { courseCode: "SS302", requestType: "elective" },
  ],
};

const EXPECTED_CATALOG_CODES = [
  "MTH101", "MTH102", "MTH201", "MTH202", "MTH301", "MTH302", "MTH401", "MTH402",
  "ENG101", "ENG102", "ENG201", "ENG301", "ENG302", "ENG401", "ENG402", "ENG403",
  "SS101", "SS201", "SS301", "SS302", "SS401", "SS402", "SS403",
  "SCI101", "SCI201", "SCI301", "SCI302", "SCI401", "SCI402", "SCI403",
  "AT101", "AT102", "AT201", "AT202", "AT301", "AT302", "AT303",
];

describe("seed data matches assignment appendix", () => {
  it("loads 37 courses from Appendix A", () => {
    const courses = loadCourses();
    expect(courses).toHaveLength(37);
    expect(courses.map((c) => c.code).sort()).toEqual([...EXPECTED_CATALOG_CODES].sort());
  });

  it("loads 10 students from Appendix B", () => {
    const students = loadStudents();
    expect(students).toHaveLength(10);
    expect(students.map((s) => s.id).sort()).toEqual(
      ["S001", "S002", "S003", "S004", "S005", "S006", "S007", "S008", "S009", "S010"].sort()
    );
  });

  it("matches suggested requests per student", () => {
    const requests = loadInitialRequests();
    for (const [studentId, expected] of Object.entries(EXPECTED_REQUESTS)) {
      const studentRequests = requests.filter((r) => r.studentId === studentId);
      expect(studentRequests, studentId).toHaveLength(expected.length);
      for (const exp of expected) {
        const match = studentRequests.find(
          (r) => r.courseCode === exp.courseCode && r.requestType === exp.requestType
        );
        expect(match, `${studentId} ${exp.courseCode} ${exp.requestType}`).toBeDefined();
      }
    }
  });

  it("uses only catalog course codes in requests", () => {
    const codes = new Set(loadCourses().map((c) => c.code));
    const requests = loadInitialRequests() as CourseRequest[];
    for (const r of requests) {
      expect(codes.has(r.courseCode), r.courseCode).toBe(true);
    }
  });

  it("S003 retake note and S010 TBD notes per appendix", () => {
    const requests = loadInitialRequests();
    const s003 = requests.find((r) => r.studentId === "S003" && r.courseCode === "MTH101");
    expect(s003?.note?.toLowerCase()).toContain("retake");

    const s010 = requests.filter((r) => r.studentId === "S010");
    expect(s010).toHaveLength(3);
    expect(s010.every((r) => r.note?.toLowerCase().includes("tbd"))).toBe(true);
  });

  it("S010 enrollment is incoming (transfer)", () => {
    const s010 = loadStudents().find((s) => s.id === "S010");
    expect(s010?.enrollmentStatus).toBe("incoming");
  });

  it("raw JSON files are wired through seed loaders", () => {
    expect(coursesData).toHaveLength(37);
    expect(studentsData).toHaveLength(10);
    expect(initialRequestsData.length).toBeGreaterThan(0);
  });
});
