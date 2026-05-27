import { NextRequest } from "next/server";

type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) => Promise<Response>;

export async function callRoute(
  handler: RouteHandler,
  options: {
    method?: string;
    body?: unknown;
    params?: Record<string, string>;
    searchParams?: Record<string, string>;
  } = {}
): Promise<Response> {
  const { method = "GET", body, params = {}, searchParams = {} } = options;
  const url = new URL("http://localhost/api/test");
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const request =
    body !== undefined
      ? new NextRequest(url, {
          method,
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        })
      : new NextRequest(url, { method });
  return handler(request, { params: Promise.resolve(params) });
}

export async function json<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}
