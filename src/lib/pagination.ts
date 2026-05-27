export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function parsePageParam(value: string | null, fallback = 1): number {
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) && n >= 1 ? n : fallback;
}

export function parsePageSizeParam(
  value: string | null,
  fallback = DEFAULT_PAGE_SIZE
): number {
  const n = parseInt(value ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return PAGE_SIZE_OPTIONS.includes(n as (typeof PAGE_SIZE_OPTIONS)[number])
    ? n
    : fallback;
}

export function paginate<T>(items: T[], page: number, pageSize: number): PaginationMeta & { items: T[] } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    items: slice,
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}
