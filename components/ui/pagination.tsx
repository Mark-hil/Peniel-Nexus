import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ButtonProps, buttonVariants } from '@/components/ui/button';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
  as?: 'a' | 'button';
} & Pick<ButtonProps, 'size'> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

const PaginationLink = ({
  className,
  isActive,
  disabled,
  size = 'icon',
  as,
  onClick,
  ...props
}: PaginationLinkProps) => {
  const isButton = as === 'button' || (!props.href && Boolean(onClick || as !== 'a'));

  const commonClasses = cn(
    buttonVariants({
      variant: isActive ? 'outline' : 'ghost',
      size,
    }),
    isActive && 'border-primary/30 bg-primary/10 text-primary font-semibold hover:bg-primary/15',
    disabled && 'pointer-events-none opacity-40 cursor-not-allowed',
    className
  );

  if (isButton) {
    return (
      <button
        type="button"
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={onClick}
        className={commonClasses}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      />
    );
  }

  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }}
      className={commonClasses}
      {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
    />
  );
};
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    disabled={disabled}
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span className="hidden sm:inline">Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    disabled={disabled}
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span className="hidden sm:inline">Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationFirst = ({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to first page"
    size="icon"
    disabled={disabled}
    className={cn('h-9 w-9', className)}
    {...props}
  >
    <ChevronsLeft className="h-4 w-4" />
  </PaginationLink>
);
PaginationFirst.displayName = 'PaginationFirst';

const PaginationLast = ({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to last page"
    size="icon"
    disabled={disabled}
    className={cn('h-9 w-9', className)}
    {...props}
  >
    <ChevronsRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationLast.displayName = 'PaginationLast';

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center text-muted-foreground', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
export { PaginationControl } from '@/components/ui/pagination-control';

