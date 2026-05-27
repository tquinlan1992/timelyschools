import { getStore } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = await getStore().getStudent(id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }
  return NextResponse.json(student.requests);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = await getStore().getStudent(id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  let body: { courseCode?: string; requestType?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { courseCode, requestType, note } = body;
  if (!courseCode || !requestType) {
    return NextResponse.json(
      { error: "courseCode and requestType are required" },
      { status: 400 }
    );
  }
  if (requestType !== "priority" && requestType !== "elective") {
    return NextResponse.json(
      { error: "requestType must be priority or elective" },
      { status: 400 }
    );
  }

  try {
    const created = await getStore().addRequest({
      studentId: id,
      courseCode,
      requestType,
      schoolYear: "2026-2027",
      note,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 409) {
      return NextResponse.json(
        { error: `${courseCode} is already on this student's request list.` },
        { status: 409 }
      );
    }
    if (err.message === "Course not found") {
      return NextResponse.json({ error: "Course not found" }, { status: 400 });
    }
    throw e;
  }
}
