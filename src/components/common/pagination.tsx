import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { strings } from '@/constants/strings';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

/** Simple page control bound to a Paginated<T> meta ({ page, limit, total }). */
export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (total <= limit) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between gap-4 pt-2 text-sm text-muted-foreground">
      <span>
        {from}–{to} {strings.common.of} {total}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          {strings.common.previous}
        </Button>
        <span className="px-2">
          {strings.common.page} {page} {strings.common.of} {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {strings.common.next}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
