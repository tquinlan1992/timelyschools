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

type StoreState = {
  courses: Map<string, Course>;
  students: ReturnType<typeof loadStudents>;
  requests: CourseRequest[];
};

function createInitialState(): StoreState {
  return {
    courses: new Map(loadCourses().map((c) => [c.code, c])),
    students: loadStudents(),
    requests: loadInitialRequests(),
  };
}

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

function buildStudentWithRequests(
  state: StoreState,
  studentId: string
): StudentWithRequests | null {
  const base = state.students.find((s) => s.id === studentId);
  if (!base) return null;

  const studentRequests = state.requests.filter((r) => r.studentId === studentId);
  const { flags, needsAttention } = computeStudentFlags(
    base,
    studentRequests,
    state.courses
  );
  const enriched = studentRequests.map((r) => enrichRequest(r, state.courses));

  return {
    ...base,
    flags,
    needsAttention,
    requests: enriched,
    requestCounts: computeRequestCounts(studentRequests),
  };
}

export function createInMemoryStore(): CourseRequestRepository {
  const state = createInitialState();

  const getStudent = async (id: string): Promise<StudentWithRequests | null> =>
    buildStudentWithRequests(state, id);

  return {
    async getStudents(params?: ListStudentsParams): Promise<StudentWithRequests[]> {
      let results = state.students
        .map((s) => buildStudentWithRequests(state, s.id))
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
    },

    getStudent,

    async getCourses(search?: string): Promise<Course[]> {
      let list = Array.from(state.courses.values());
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.code.toLowerCase().includes(q) ||
            c.department.toLowerCase().includes(q)
        );
      }
      return list.sort(
        (a, b) =>
          a.department.localeCompare(b.department) || a.name.localeCompare(b.name)
      );
    },

    async getRequests(studentId: string): Promise<EnrichedCourseRequest[]> {
      const student = await getStudent(studentId);
      return student?.requests ?? [];
    },

    async addRequest(
      input: Omit<CourseRequest, "id">
    ): Promise<EnrichedCourseRequest> {
      if (!state.courses.has(input.courseCode)) {
        throw new Error("Course not found");
      }
      const duplicate = state.requests.some(
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
      state.requests.push(request);
      return enrichRequest(request, state.courses);
    },

    async updateRequest(
      id: string,
      patch: Partial<Pick<CourseRequest, "requestType" | "note">>
    ): Promise<EnrichedCourseRequest> {
      const index = state.requests.findIndex((r) => r.id === id);
      if (index === -1) {
        const err = new Error("Request not found") as Error & { status: number };
        err.status = 404;
        throw err;
      }
      state.requests[index] = { ...state.requests[index], ...patch };
      return enrichRequest(state.requests[index], state.courses);
    },

    async deleteRequest(id: string): Promise<void> {
      const index = state.requests.findIndex((r) => r.id === id);
      if (index === -1) {
        const err = new Error("Request not found") as Error & { status: number };
        err.status = 404;
        throw err;
      }
      state.requests.splice(index, 1);
    },
  };
}

let storeInstance: CourseRequestRepository | null = null;

export function createStore(): CourseRequestRepository {
  return createInMemoryStore();
}

export function getStore(): CourseRequestRepository {
  if (!storeInstance) {
    storeInstance = createStore();
  }
  return storeInstance;
}

export function resetStore(): void {
  storeInstance = createStore();
}
