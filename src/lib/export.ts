import type { CourseRequest, SchedulingExport } from "@/types";
import { SCHOOL_YEAR } from "@/constants";

export function buildSchedulingExport(
  studentId: string,
  requests: CourseRequest[],
  version = 1
): SchedulingExport {
  return {
    studentId,
    schoolYear: SCHOOL_YEAR,
    version,
    exportedAt: new Date().toISOString(),
    requests: requests.map((r) => ({
      courseCode: r.courseCode,
      requestType: r.requestType,
      ...(r.note ? { note: r.note } : {}),
    })),
  };
}
