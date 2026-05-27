import { getStore } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const filter = searchParams.get("filter") as "all" | "needs_attention" | null;
  const gradeParam = searchParams.get("grade");
  const grade = gradeParam ? parseInt(gradeParam, 10) : undefined;

  const students = await getStore().getStudents({
    search,
    filter: filter === "needs_attention" ? "needs_attention" : "all",
    grade: Number.isNaN(grade) ? undefined : grade,
  });

  const attentionCount = students.filter((s) => s.needsAttention).length;

  return NextResponse.json({ students, attentionCount, schoolYear: "2026-2027" });
}
