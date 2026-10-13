/**
 * Pagination helper utilities
 */

export interface PaginationResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginate an in-memory array of items safely
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): PaginationResult<T> {
  const safePageSize = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const endIndex = Math.min(currentPage * safePageSize, totalItems);

  const startSlice = (currentPage - 1) * safePageSize;
  const data = items.slice(startSlice, startSlice + safePageSize);

  return {
    data,
    totalItems,
    totalPages,
    currentPage,
    pageSize: safePageSize,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

/**
 * Generates an array of page numbers with ellipsis markers for display
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): (number | 'ellipsis')[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  // Always show first page
  pages.push(1);

  const leftBound = Math.max(2, currentPage - 1);
  const rightBound = Math.min(totalPages - 1, currentPage + 1);

  if (leftBound > 2) {
    pages.push('ellipsis');
  }

  for (let i = leftBound; i <= rightBound; i++) {
    pages.push(i);
  }

  if (rightBound < totalPages - 1) {
    pages.push('ellipsis');
  }

  // Always show last page
  pages.push(totalPages);

  return pages;
}
