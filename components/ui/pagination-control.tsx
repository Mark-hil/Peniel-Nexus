'use client';

import * as React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getPageNumbers } from '@/lib/pagination';
import { cn } from '@/lib/utils';

export interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  startIndex?: number;
  endIndex?: number;
  itemLabel?: string;
  showPageSize?: boolean;
  className?: string;
}

export function PaginationControl({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
  startIndex,
  endIndex,
  itemLabel = 'items',
  showPageSize = false,
  className,
}: PaginationControlProps) {
  if (totalItems === 0) return null;

  const actualStart =
    startIndex !== undefined ? startIndex : (currentPage - 1) * pageSize + 1;
  const actualEnd =
    endIndex !== undefined ? endIndex : Math.min(currentPage * pageSize, totalItems);

  const pageNumbers = getPageNumbers(currentPage, totalPages, 5);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 px-2 py-4 sm:flex-row sm:items-center sm:justify-between border-t border-border/40 text-sm text-muted-foreground',
        className
      )}
    >
      {/* Count & Page Size */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm">
          Showing{' '}
          <span className="font-semibold text-foreground">{actualStart}</span> to{' '}
          <span className="font-semibold text-foreground">{actualEnd}</span> of{' '}
          <span className="font-semibold text-foreground">{totalItems}</span>{' '}
          {itemLabel}
        </p>

        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-border/50">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Pagination Navigation */}
      {totalPages > 1 && (
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent className="gap-1">
            {/* First Page */}
            <PaginationItem className="hidden md:inline-flex">
              <PaginationFirst
                disabled={currentPage <= 1}
                onClick={() => onPageChange(1)}
              />
            </PaginationItem>

            {/* Previous */}
            <PaginationItem>
              <PaginationPrevious
                disabled={currentPage <= 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              />
            </PaginationItem>

            {/* Mobile simplified page indicator */}
            <PaginationItem className="sm:hidden px-2 text-xs font-medium">
              Page {currentPage} of {totalPages}
            </PaginationItem>

            {/* Desktop page links */}
            {pageNumbers.map((p, idx) => (
              <PaginationItem key={idx} className="hidden sm:inline-flex">
                {p === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={currentPage === p}
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {/* Next */}
            <PaginationItem>
              <PaginationNext
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              />
            </PaginationItem>

            {/* Last Page */}
            <PaginationItem className="hidden md:inline-flex">
              <PaginationLast
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(totalPages)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
