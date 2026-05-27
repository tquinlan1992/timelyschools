import { getStore } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const courses = await getStore().getCourses(search);
  return NextResponse.json(courses);
}
