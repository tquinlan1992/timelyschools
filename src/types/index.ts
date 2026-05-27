export type RequestType = "priority" | "elective";

export type StudentFlag =
  | "ell"
  | "retake"
  | "transfer"
  | "ap_heavy"
  | "no_requests"
  | "credit_pending";

export type EnrollmentStatus = "active" | "incoming" | "withdrawn";

export interface Course {
  code: string;
  name: string;
  department: string;
  grades: number[];
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  profile: string;
  flags: StudentFlag[];
  needsAttention: boolean;
  enrollmentStatus: EnrollmentStatus;
}

export interface CourseRequest {
  id: string;
  studentId: string;
  courseCode: string;
  requestType: RequestType;
  schoolYear: string;
  note?: string;
}

export interface RequestCounts {
  total: number;
  priority: number;
  elective: number;
}

export interface StudentWithRequests extends Student {
  requests: EnrichedCourseRequest[];
  requestCounts: RequestCounts;
}

export interface EnrichedCourseRequest extends CourseRequest {
  courseName: string;
  department: string;
}

export interface SchedulingExport {
  studentId: string;
  schoolYear: string;
  version: number;
  exportedAt: string;
  requests: Array<{
    courseCode: string;
    requestType: RequestType;
    note?: string;
  }>;
}
