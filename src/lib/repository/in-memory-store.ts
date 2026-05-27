import { SCHOOL_YEAR } from "@/constants";
import {
  computeRequestCounts,
  computeStudentFlags,
  sortStudents,
} from "@/lib/flags";
import { loadCourses, loadInitialRequests, loadStudents } from "@/lib/repository/seed-data";
import type { ListStudentsParams, CourseRequestRepository } from "@/lib/repository/types";
import type {
  Course,
  CourseRequest,
  EnrichedCourseRequest,
  StudentWithRequests,
} from "@/types";
import { randomUUID } from "crypto";

function enrichRequest(
  request: CourseRequest,
  courses: Map<string, Course>
): EnrichedCourseRequest {
  const course = courses.get(request.courseCode);
  return {
    ...request,
    courseName: course?.name ?? request.courseCode,
    department: course?.department ?? "Unknown",
  };
}

export class InMemoryStore implements CourseRequestRepository {
  private courses: Map<string, Course>;
  private students: ReturnType<typeof loadStudents>;
  private requests: CourseRequest[];

  constructor() {
    this.courses = new Map(loadCourses().map((c) => [c.code, c]));
    this.students = loadStudents();
    this.requests = loadInitialRequests();
  }

  private getCourseMap(): Map<string, Course> {
    return this.courses;
  }

  private buildStudentWithRequests(studentId: string): StudentWithRequests | null {
    const base = this.students.find((s) => s.id === studentId);
    if (!base) return null;

    const studentRequests = this.requests.filter((r) => r.studentId === studentId);
    const { flags, needsAttention } = computeStudentFlags(
      base,
      studentRequests,
      this.getCourseMap()
    );
    const enriched = studentRequests.map((r) => enrichRequest(r, this.getCourseMap()));

    return {
      ...base,
      flags,
      needsAttention,
      requests: enriched,
      requestCounts: computeRequestCounts(studentRequests),
    };
  }

  async getStudents(params?: ListStudentsParams): Promise<StudentWithRequests[]> {
    let results = this.students
      .map((s) => this.buildStudentWithRequests(s.id))
      .filter((s): s is StudentWithRequests => s !== null);

    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (params?.filter === "needs_attention") {
      results = results.filter((s) => s.needsAttention);
    }
    if (params?.grade !== undefined) {
      results = results.filter((s) => s.grade === params.grade);
    }

    return sortStudents(results);
  }

  async getStudent(id: string): Promise<StudentWithRequests | null> {
    return this.buildStudentWithRequests(id);
  }

  async getCourses(search?: string): Promise<Course[]> {
    let list = Array.from(this.courses.values());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) =>
      a.department.localeCompare(b.department) || a.name.localeCompare(b.name)
    );
  }

  async getRequests(studentId: string): Promise<EnrichedCourseRequest[]> {
    const student = await this.getStudent(studentId);
    return student?.requests ?? [];
  }

  async addRequest(
    input: Omit<CourseRequest, "id">
  ): Promise<EnrichedCourseRequest> {
    if (!this.courses.has(input.courseCode)) {
      throw new Error("Course not found");
    }
    const duplicate = this.requests.some(
      (r) => r.studentId === input.studentId && r.courseCode === input.courseCode
    );
    if (duplicate) {
      const err = new Error("Course already on student request list") as Error & {
        status: number;
      };
      err.status = 409;
      throw err;
    }

    const request: CourseRequest = {
      id: randomUUID(),
      ...input,
      schoolYear: SCHOOL_YEAR,
    };
    this.requests.push(request);
    return enrichRequest(request, this.getCourseMap());
  }

  async updateRequest(
    id: string,
    patch: Partial<Pick<CourseRequest, "requestType" | "note">>
  ): Promise<EnrichedCourseRequest> {
    const index = this.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      const err = new Error("Request not found") as Error & { status: number };
      err.status = 404;
      throw err;
    }
    this.requests[index] = { ...this.requests[index], ...patch };
    return enrichRequest(this.requests[index], this.getCourseMap());
  }

  async deleteRequest(id: string): Promise<void> {
    const index = this.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      const err = new Error("Request not found") as Error & { status: number };
      err.status = 404;
      throw err;
    }
    this.requests.splice(index, 1);
  }
}

let storeInstance: InMemoryStore | null = null;

export function createStore(): InMemoryStore {
  return new InMemoryStore();
}

export function getStore(): InMemoryStore {
  if (!storeInstance) {
    storeInstance = createStore();
  }
  return storeInstance;
}

export function resetStore(): void {
  storeInstance = createStore();
}
