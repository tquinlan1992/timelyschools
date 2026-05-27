import { getStore } from "@/lib/store";
import type { RequestType } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  let body: { requestType?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    body.requestType !== undefined &&
    body.requestType !== "priority" &&
    body.requestType !== "elective"
  ) {
    return NextResponse.json(
      { error: "requestType must be priority or elective" },
      { status: 400 }
    );
  }

  try {
    const patch: Partial<{ requestType: RequestType; note: string }> = {};
    if (body.requestType) patch.requestType = body.requestType as RequestType;
    if (body.note !== undefined) patch.note = body.note;
    const updated = await getStore().updateRequest(requestId, patch);
    return NextResponse.json(updated);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 404) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  try {
    await getStore().deleteRequest(requestId);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 404) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    throw e;
  }
}
