import type { CourseRequest, Student } from "@/types";
import { SCHOOL_YEAR } from "@/constants";

export function buildStudent(
  overrides: Partial<Omit<Student, "flags" | "needsAttention">> = {}
): Omit<Student, "flags" | "needsAttention"> {
  return {
    id: "S999",
    name: "Test Student",
    grade: 10,
    profile: "Test profile",
    enrollmentStatus: "active",
    ...overrides,
  };
}

export function buildRequest(overrides: Partial<CourseRequest> = {}): CourseRequest {
  return {
    id: "req-1",
    studentId: "S001",
    courseCode: "MTH101",
    requestType: "priority",
    schoolYear: SCHOOL_YEAR,
    ...overrides,
  };
}
