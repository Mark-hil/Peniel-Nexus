'use client';

import * as React from 'react';
import { paginate, getPageNumbers, type PaginationResult } from '@/lib/pagination';

export interface UsePaginationOptions<T> {
  items: T[];
  initialPage?: number;
  initialPageSize?: number;
}

export interface UsePaginationReturn<T> extends PaginationResult<T> {
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  pageNumbers: (number | 'ellipsis')[];
}

export function usePagination<T>({
  items,
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [page, setPageState] = React.useState(initialPage);
  const [pageSize, setPageSizeState] = React.useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Auto-clamp page if items list shrinks (e.g., from search/filtering)
  React.useEffect(() => {
    if (page > totalPages) {
      setPageState(1);
    }
  }, [items.length, totalPages, page]);

  const setPage = React.useCallback(
    (action: number | ((prev: number) => number)) => {
      setPageState((prev) => {
        const next = typeof action === 'function' ? action(prev) : action;
        return Math.max(1, Math.min(next, totalPages));
      });
    },
    [totalPages]
  );

  const setPageSize = React.useCallback((size: number) => {
    const validSize = Math.max(1, size);
    setPageSizeState(validSize);
    setPageState(1);
  }, []);

  const nextPage = React.useCallback(() => {
    setPage((p) => p + 1);
  }, [setPage]);

  const prevPage = React.useCallback(() => {
    setPage((p) => p - 1);
  }, [setPage]);

  const firstPage = React.useCallback(() => {
    setPage(1);
  }, [setPage]);

  const lastPage = React.useCallback(() => {
    setPage(totalPages);
  }, [setPage, totalPages]);

  const paginationResult = React.useMemo(() => {
    return paginate(items, page, pageSize);
  }, [items, page, pageSize]);

  const pageNumbers = React.useMemo(() => {
    return getPageNumbers(paginationResult.currentPage, paginationResult.totalPages);
  }, [paginationResult.currentPage, paginationResult.totalPages]);

  return {
    ...paginationResult,
    page: paginationResult.currentPage,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    pageNumbers,
  };
}
