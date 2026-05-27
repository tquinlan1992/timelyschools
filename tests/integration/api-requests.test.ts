import { describe, expect, it } from "vitest";
import { GET as getStudent } from "@/app/api/students/[id]/route";
import {
  GET as getRequests,
  POST as postRequest,
} from "@/app/api/students/[id]/requests/route";
import {
  PATCH as patchRequest,
  DELETE as deleteRequest,
} from "@/app/api/requests/[requestId]/route";
import { callRoute, json } from "../helpers/api";

describe("POST /api/students/[id]/requests", () => {
  it("creates a request", async () => {
    const res = await callRoute(postRequest, {
      method: "POST",
      params: { id: "S001" },
      body: { courseCode: "AT102", requestType: "elective" },
    });
    expect(res.status).toBe(201);
    const data = await json<{ courseCode: string; courseName: string }>(res);
    expect(data.courseCode).toBe("AT102");
    expect(data.courseName).toBe("Visual Arts I");
  });

  it("returns 409 for duplicate", async () => {
    const res = await callRoute(postRequest, {
      method: "POST",
      params: { id: "S001" },
      body: { courseCode: "MTH101", requestType: "priority" },
    });
    expect(res.status).toBe(409);
  });

  it("returns 400 when fields missing", async () => {
    const res = await callRoute(postRequest, {
      method: "POST",
      params: { id: "S001" },
      body: { courseCode: "MTH102" },
    });
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/requests/[requestId]", () => {
  it("updates request type", async () => {
    const studentRes = await callRoute(getStudent, { params: { id: "S001" } });
    const student = await json<{ requests: { id: string }[] }>(studentRes);
    const requestId = student.requests[0].id;

    const res = await callRoute(patchRequest, {
      method: "PATCH",
      params: { requestId },
      body: { requestType: "elective" },
    });
    expect(res.status).toBe(200);
    const updated = await json<{ requestType: string }>(res);
    expect(updated.requestType).toBe("elective");
  });

  it("returns 404 for unknown request", async () => {
    const res = await callRoute(patchRequest, {
      method: "PATCH",
      params: { requestId: "missing-id" },
      body: { requestType: "priority" },
    });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/requests/[requestId]", () => {
  it("deletes and persists after refresh", async () => {
    const listRes = await callRoute(getRequests, { params: { id: "S001" } });
    const requests = await json<{ id: string; courseCode: string }[]>(listRes);
    const target = requests.find((r) => r.courseCode === "AT101")!;

    const deleteRes = await callRoute(deleteRequest, {
      method: "DELETE",
      params: { requestId: target.id },
    });
    expect(deleteRes.status).toBe(204);

    const afterRes = await callRoute(getRequests, { params: { id: "S001" } });
    const after = await json<{ id: string }[]>(afterRes);
    expect(after.find((r) => r.id === target.id)).toBeUndefined();
  });
});
