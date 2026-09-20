import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, type QueryKey } from "@tanstack/react-query";

export interface ListPage<T> {
  pageItems: T[];
  totalPages: number;
  safePage: number;
  totalCount: number;
}

export interface UseListQueryOptions<T> {
  /** Passed straight through to useQuery. */
  queryKey: QueryKey;
  queryFn: () => Promise<T[]>;
  /** Rows per page used by `paginate`. Defaults to 10 (Users.tsx used 5). */
  itemsPerPage?: number;
  /**
   * Returns the searchable strings for one item (e.g. name/email/phone).
   * When omitted, `searchedItems` is just `items` unfiltered.
   */
  searchFields?: (item: T) => Array<string | null | undefined>;
  /**
   * Called when the query errors. Left to the caller (e.g. toast.error) so
   * pages that previously showed no error toast keep showing none — this
   * hook does not add error UI a page didn't already have.
   */
  onError?: (error: unknown) => void;
}

export interface UseListQueryResult<T> {
  items: T[];
  isLoading: boolean;
  error: unknown;
  searchQuery: string;
  /** Updates the search query and resets currentPage to 1, same as every
   *  hand-rolled search input did before this hook existed. */
  setSearchQuery: (query: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  /** `items` filtered by `searchFields` against `searchQuery`. Apply any
   *  further page-specific filters (role, status, ...) on top of this. */
  searchedItems: T[];
  itemsPerPage: number;
  /** Slices `list` (defaults to `searchedItems`) for the current page,
   *  clamping currentPage the same way every page's inline pagination math
   *  did: `Math.ceil(length / itemsPerPage) || 1`, then `Math.min`. */
  paginate: (list?: T[]) => ListPage<T>;
}

export function useListQuery<T>({
  queryKey,
  queryFn,
  itemsPerPage = 10,
  searchFields,
  onError,
}: UseListQueryOptions<T>): UseListQueryResult<T> {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey,
    queryFn,
  });

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const [searchQuery, setSearchQueryState] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
  }, []);

  const searchedItems = useMemo(() => {
    if (!searchFields) return items;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return items;
    return items.filter((item) =>
      searchFields(item).some((field) => (field ?? "").toLowerCase().includes(query))
    );
  }, [items, searchQuery, searchFields]);

  const paginate = useCallback(
    (list: T[] = searchedItems): ListPage<T> => {
      const totalPages = Math.ceil(list.length / itemsPerPage) || 1;
      const safePage = Math.min(currentPage, totalPages);
      const pageItems = list.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);
      return { pageItems, totalPages, safePage, totalCount: list.length };
    },
    [searchedItems, itemsPerPage, currentPage]
  );

  return {
    items,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    searchedItems,
    itemsPerPage,
    paginate,
  };
}
