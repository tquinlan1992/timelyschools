import { resetStore } from "@/lib/store";
import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.ALLOW_TEST_RESET !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  resetStore();
  return NextResponse.json({ ok: true });
}
