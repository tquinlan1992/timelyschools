import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";
import type { PaginationMeta } from "@/lib/pagination";

export function Pagination({
  meta,
  onPageChange,
  onPageSizeChange,
  disabled,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  disabled?: boolean;
}) {
  const { page, pageSize, total, totalPages } = meta;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <p className="pagination-summary">
        {total === 0 ? (
          "No results"
        ) : (
          <>
            <span className="pagination-range">
              {from}–{to}
            </span>{" "}
            of {total}
          </>
        )}
      </p>
      <div className="pagination-controls">
        <label className="pagination-size">
          <span className="pagination-size-label">Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={disabled}
            aria-label="Rows per page"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <div className="pagination-buttons">
          <button
            type="button"
            className="btn btn-ghost pagination-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || page <= 1}
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="pagination-page" aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-ghost pagination-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || page >= totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
