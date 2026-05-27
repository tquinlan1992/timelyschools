import coursesData from "@/data/courses.json";
import studentsData from "@/data/students.json";
import initialRequestsData from "@/data/initial-requests.json";
import { SCHOOL_YEAR } from "@/constants";
import { randomUUID } from "crypto";
import type { Course, CourseRequest, Student } from "@/types";

export function loadCourses(): Course[] {
  return coursesData as Course[];
}

export function loadStudents(): Omit<Student, "flags" | "needsAttention">[] {
  return studentsData as Omit<Student, "flags" | "needsAttention">[];
}

export function loadInitialRequests(): CourseRequest[] {
  return (
    initialRequestsData as Array<{
      studentId: string;
      courseCode: string;
      requestType: "priority" | "elective";
      note?: string;
    }>
  ).map((r) => ({
    id: randomUUID(),
    studentId: r.studentId,
    courseCode: r.courseCode,
    requestType: r.requestType,
    schoolYear: SCHOOL_YEAR,
    note: r.note,
  }));
}
