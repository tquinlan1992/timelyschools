import type { Course, CourseRequest, RequestCounts, Student, StudentFlag } from "@/types";

function profileIncludes(student: { profile: string }, phrase: string): boolean {
  return student.profile.toLowerCase().includes(phrase.toLowerCase());
}

export function countApCourses(requests: CourseRequest[], courses: Map<string, Course>): number {
  const apPattern = /^(MTH4|ENG4|SS4|SCI4|AT301)/;
  return requests.filter((r) => {
    const course = courses.get(r.courseCode);
    return course && apPattern.test(course.code);
  }).length;
}

export function computeRequestCounts(requests: CourseRequest[]): RequestCounts {
  const priority = requests.filter((r) => r.requestType === "priority").length;
  const elective = requests.filter((r) => r.requestType === "elective").length;
  return { total: requests.length, priority, elective };
}

/**
 * Flags and needs-attention for the four Appendix B edge cases only:
 * S002 ELL, S003 retake, S009 full AP load, S010 transfer.
 * `no_requests` is computed when a list is empty (e.g. after counselor removes all)
 * but is not a seeded scenario in the assignment data.
 */
export function computeStudentFlags(
  student: Omit<Student, "flags" | "needsAttention">,
  requests: CourseRequest[],
  courses: Map<string, Course>
): { flags: StudentFlag[]; needsAttention: boolean } {
  void courses;
  const flags: StudentFlag[] = [];

  if (profileIncludes(student, "english language learner")) {
    flags.push("ell");
  }
  if (
    profileIncludes(student, "must retake") ||
    requests.some((r) => r.note?.toLowerCase().includes("retake"))
  ) {
    flags.push("retake");
  }
  if (profileIncludes(student, "full ap load")) {
    flags.push("ap_heavy");
  }
  if (
    student.enrollmentStatus === "incoming" ||
    profileIncludes(student, "transferred")
  ) {
    flags.push("transfer");
  }
  if (profileIncludes(student, "credit evaluation pending")) {
    flags.push("credit_pending");
  }
  if (requests.length === 0) {
    flags.push("no_requests");
  }

  const needsAttention =
    flags.includes("ell") ||
    flags.includes("retake") ||
    flags.includes("ap_heavy") ||
    flags.includes("transfer");

  return { flags, needsAttention };
}

export function sortStudents<T extends { needsAttention: boolean; grade: number; name: string }>(
  students: T[]
): T[] {
  return [...students].sort((a, b) => {
    if (a.needsAttention !== b.needsAttention) return a.needsAttention ? -1 : 1;
    if (a.grade !== b.grade) return a.grade - b.grade;
    return a.name.localeCompare(b.name);
  });
}
