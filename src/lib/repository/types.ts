import type {
  Course,
  CourseRequest,
  EnrichedCourseRequest,
  StudentWithRequests,
} from "@/types";

export interface ListStudentsParams {
  search?: string;
  filter?: "all" | "needs_attention";
  grade?: number;
}

export interface CourseRequestRepository {
  getStudents(params?: ListStudentsParams): Promise<StudentWithRequests[]>;
  getStudent(id: string): Promise<StudentWithRequests | null>;
  getCourses(search?: string): Promise<Course[]>;
  getRequests(studentId: string): Promise<EnrichedCourseRequest[]>;
  addRequest(
    input: Omit<CourseRequest, "id">
  ): Promise<EnrichedCourseRequest>;
  updateRequest(
    id: string,
    patch: Partial<Pick<CourseRequest, "requestType" | "note">>
  ): Promise<EnrichedCourseRequest>;
  deleteRequest(id: string): Promise<void>;
}
