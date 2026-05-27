import { describe, expect, it } from "vitest";
import { GET as getStudents } from "@/app/api/students/route";
import { GET as getStudent } from "@/app/api/students/[id]/route";
import { GET as getCourses } from "@/app/api/courses/route";
import { callRoute, json } from "../helpers/api";

describe("GET /api/students", () => {
  it("returns paginated students and cohort attention count", async () => {
    const res = await callRoute(getStudents);
    expect(res.status).toBe(200);
    const data = await json<{
      students: unknown[];
      attentionCount: number;
      pagination: { total: number; page: number; pageSize: number };
    }>(res);
    expect(data.students).toHaveLength(10);
    expect(data.pagination.total).toBe(10);
    expect(data.attentionCount).toBeGreaterThan(0);
  });

  it("paginates with page and pageSize", async () => {
    const res = await callRoute(getStudents, {
      searchParams: { page: "1", pageSize: "5" },
    });
    const data = await json<{ students: unknown[]; pagination: { totalPages: number } }>(res);
    expect(data.students).toHaveLength(5);
    expect(data.pagination.totalPages).toBe(2);
  });

  it("filters needs_attention", async () => {
    const res = await callRoute(getStudents, {
      searchParams: { filter: "needs_attention" },
    });
    const data = await json<{ students: { needsAttention: boolean }[] }>(res);
    expect(data.students.every((s) => s.needsAttention)).toBe(true);
  });
});

describe("GET /api/students/[id]", () => {
  it("returns student with requests", async () => {
    const res = await callRoute(getStudent, { params: { id: "S001" } });
    expect(res.status).toBe(200);
    const data = await json<{ id: string; requests: unknown[] }>(res);
    expect(data.id).toBe("S001");
    expect(data.requests.length).toBeGreaterThan(0);
  });

  it("returns 404 for unknown student", async () => {
    const res = await callRoute(getStudent, { params: { id: "S999" } });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/courses", () => {
  it("filters catalog by search", async () => {
    const res = await callRoute(getCourses, {
      searchParams: { search: "algebra" },
    });
    const courses = await json<{ code: string; name: string }[]>(res);
    expect(courses.length).toBeGreaterThan(0);
    expect(courses.some((c) => c.name.toLowerCase().includes("algebra"))).toBe(true);
  });
});
