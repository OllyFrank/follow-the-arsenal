import { useMemo, useState } from "react";

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(page, totalPages - 1);

  const pageItems = useMemo(
    () => items.slice(clampedPage * pageSize, (clampedPage + 1) * pageSize),
    [items, clampedPage, pageSize],
  );

  return { page: clampedPage, setPage, totalPages, pageItems };
}
