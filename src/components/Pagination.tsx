import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    if (totalPages <= 1) return null;

    // Build page numbers with ellipsis
    const getPageNumbers = (): (number | "...")[] => {
        const pages: (number | "...")[] = [];
        const delta = 1; // pages around current

        const rangeStart = Math.max(2, currentPage - delta);
        const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

        // Always show page 1
        pages.push(1);

        if (rangeStart > 2) {
            pages.push("...");
        }

        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }

        if (rangeEnd < totalPages - 1) {
            pages.push("...");
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="join flex justify-center mt-8">
            {/* Previous Button */}
            <button
                className="join-item btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                «
            </button>

            {/* Page Numbers */}
            {pageNumbers.map((page, index) =>
                page === "..." ? (
                    <button key={`ellipsis-${index}`} className="join-item btn btn-sm btn-disabled">
                        …
                    </button>
                ) : (
                    <button
                        key={page}
                        className={`join-item btn btn-sm ${currentPage === page ? "btn-active" : ""}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                )
            )}

            {/* Next Button */}
            <button
                className="join-item btn btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                »
            </button>
        </div>
    );
};

export default Pagination;
