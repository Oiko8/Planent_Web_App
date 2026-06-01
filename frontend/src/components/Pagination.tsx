import type { PageResponse } from "../types/event";

type Props = {
    pageData: PageResponse<unknown> | null;
    onPageChange: (page: number) => void;
};

export default function Pagination({ pageData, onPageChange }: Props) {
    // Hide pagination entirely when there's nothing or only one page
    if (!pageData || pageData.page.totalPages <= 1) return null;

    const { number: currentPage, totalPages } = pageData.page;
    // Spring's PagedModel no longer ships `first`/`last`. Compute them.
    const first = currentPage === 0;
    const last  = currentPage >= totalPages - 1;

    function goTo(newPage: number) {
        onPageChange(newPage);
        // Scroll to top so the user lands at the start of the new page
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <div className="pagination">
            <button
                className="pagination-button"
                onClick={() => goTo(currentPage - 1)}
                disabled={first}
            >
                ← Previous
            </button>

            <span className="pagination-info">
                Page {currentPage + 1} of {totalPages}
            </span>

            <button
                className="pagination-button"
                onClick={() => goTo(currentPage + 1)}
                disabled={last}
            >
                Next →
            </button>
        </div>
    );
}