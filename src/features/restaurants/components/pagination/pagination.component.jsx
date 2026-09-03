import { useMemo } from "react";

/** Next / Prev + page number pagination bar. */
const PaginationBar = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  loading,
  onNext,
  onPrev,
  onGoToPage,
}) => {
  // Only render page numbers we know are reachable (current, and one ahead
  // once it's been fetched) to avoid implying you can skip past uncached pages.
  const visiblePages = useMemo(() => {
    const pages = [];
    for (
      let p = 1;
      p <= Math.min(currentPage + (hasNextPage ? 1 : 0), totalPages);
      p++
    ) {
      pages.push(p);
    }
    return pages;
  }, [currentPage, hasNextPage, totalPages]);

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <button
        onClick={onPrev}
        disabled={!hasPrevPage || loading}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>

      {visiblePages.map((p) => (
        <button
          key={p}
          onClick={() => onGoToPage(p)}
          disabled={loading}
          className={`w-8 h-8 text-sm rounded-lg border hover:cursor-pointer ${
            p === currentPage
              ? "bg-black text-white border-black"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={onNext}
        disabled={!hasNextPage || loading}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};

export default PaginationBar;