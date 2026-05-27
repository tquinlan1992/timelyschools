import type { Course, CourseRequest, RequestCounts, Student, StudentFlag } from "@/types";

const AP_CODE_PATTERN = /^(MTH4|ENG4|SS4|SCI4|AT301)/;

function profileIncludes(student: { profile: string }, phrase: string): boolean {
  return student.profile.toLowerCase().includes(phrase.toLowerCase());
}

export function countApCourses(requests: CourseRequest[], courses: Map<string, Course>): number {
  return requests.filter((r) => {
    const course = courses.get(r.courseCode);
    return course && AP_CODE_PATTERN.test(course.code);
  }).length;
}

export function computeRequestCounts(requests: CourseRequest[]): RequestCounts {
  const priority = requests.filter((r) => r.requestType === "priority").length;
  const elective = requests.filter((r) => r.requestType === "elective").length;
  return { total: requests.length, priority, elective };
}

export function computeStudentFlags(
  student: Omit<Student, "flags" | "needsAttention">,
  requests: CourseRequest[],
  courses: Map<string, Course>
): { flags: StudentFlag[]; needsAttention: boolean } {
  const flags: StudentFlag[] = [];

  if (profileIncludes(student, "english language learner")) {
    flags.push("ell");
  }
  if (
    profileIncludes(student, "must retake") ||
    profileIncludes(student, "failed") ||
    requests.some((r) => r.note?.toLowerCase().includes("retake"))
  ) {
    flags.push("retake");
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
  if (countApCourses(requests, courses) >= 4) {
    flags.push("ap_heavy");
  }

  const needsAttention =
    student.enrollmentStatus === "incoming" ||
    requests.length === 0 ||
    requests.some((r) => r.note?.toLowerCase().includes("tbd")) ||
    flags.includes("ell") ||
    flags.includes("retake") ||
    flags.includes("ap_heavy") ||
    flags.includes("credit_pending");

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
