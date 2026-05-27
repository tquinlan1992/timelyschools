import type { Course } from "@/types";

export function buildCourse(overrides: Partial<Course> = {}): Course {
  return {
    code: "MTH101",
    name: "Algebra I",
    department: "Math",
    grades: [9],
    ...overrides,
  };
}

export function buildCourseMap(courses: Course[]): Map<string, Course> {
  return new Map(courses.map((c) => [c.code, c]));
}
