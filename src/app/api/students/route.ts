import { getStore } from "@/lib/store";
import {
  DEFAULT_PAGE_SIZE,
  paginate,
  parsePageParam,
  parsePageSizeParam,
} from "@/lib/pagination";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const filter = searchParams.get("filter") as "all" | "needs_attention" | null;
  const gradeParam = searchParams.get("grade");
  const grade = gradeParam ? parseInt(gradeParam, 10) : undefined;
  const page = parsePageParam(searchParams.get("page"));
  const pageSize = parsePageSizeParam(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE);

  const store = getStore();
  const filtered = await store.getStudents({
    search,
    filter: filter === "needs_attention" ? "needs_attention" : "all",
    grade: Number.isNaN(grade) ? undefined : grade,
  });

  const cohort = await store.getStudents();
  const attentionCount = cohort.filter((s) => s.needsAttention).length;

  const { items: students, ...pagination } = paginate(filtered, page, pageSize);

  return NextResponse.json({
    students,
    pagination,
    attentionCount,
    schoolYear: "2026-2027",
  });
}
