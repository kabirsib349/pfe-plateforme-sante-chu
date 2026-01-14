import { useState, useMemo, useCallback } from 'react';

/**
 * Options for the usePagination hook.
 */
export interface UsePaginationOptions<T> {
    /** Array of items to paginate */
    items: T[];
    /** Number of items per page */
    itemsPerPage?: number;
    /** Initial page number (1-indexed) */
    initialPage?: number;
    /** Initial search query */
    initialSearch?: string;
    /** Filter function to apply with search */
    filterFn?: (item: T, query: string) => boolean;
}

/**
 * Return type for the usePagination hook.
 */
export interface UsePaginationReturn<T> {
    /** Current page number (1-indexed) */
    page: number;
    /** Set the current page */
    setPage: (page: number) => void;
    /** Total number of pages */
    totalPages: number;
    /** Items for the current page */
    paginatedItems: T[];
    /** Current search query */
    search: string;
    /** Set the search query (resets page to 1) */
    setSearch: (query: string) => void;
    /** Total number of filtered items */
    filteredCount: number;
    /** Go to previous page */
    prevPage: () => void;
    /** Go to next page */
    nextPage: () => void;
    /** Check if there's a previous page */
    hasPrevPage: boolean;
    /** Check if there's a next page */
    hasNextPage: boolean;
}

const DEFAULT_ITEMS_PER_PAGE = 10;

/**
 * Generic hook for pagination with optional search filtering.
 * 
 * @example
 * ```tsx
 * const { paginatedItems, page, setPage, totalPages, search, setSearch } = usePagination({
 *   items: formulaires,
 *   itemsPerPage: 5,
 *   filterFn: (item, query) => item.titre.toLowerCase().includes(query.toLowerCase())
 * });
 * ```
 */
export function usePagination<T>({
    items,
    itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
    initialPage = 1,
    initialSearch = '',
    filterFn
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
    const [page, setPage] = useState(initialPage);
    const [search, setSearchState] = useState(initialSearch);

    // Filter items based on search query
    const filteredItems = useMemo(() => {
        if (!search.trim() || !filterFn) {
            return items;
        }
        return items.filter(item => filterFn(item, search));
    }, [items, search, filterFn]);

    // Calculate total pages
    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    }, [filteredItems.length, itemsPerPage]);

    // Ensure current page is valid
    const validPage = useMemo(() => {
        return Math.min(Math.max(1, page), totalPages);
    }, [page, totalPages]);

    // Get paginated items
    const paginatedItems = useMemo(() => {
        const startIndex = (validPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredItems.slice(startIndex, endIndex);
    }, [filteredItems, validPage, itemsPerPage]);

    // Set search and reset to page 1
    const setSearch = useCallback((query: string) => {
        setSearchState(query);
        setPage(1);
    }, []);

    // Navigation helpers
    const prevPage = useCallback(() => {
        setPage(p => Math.max(1, p - 1));
    }, []);

    const nextPage = useCallback(() => {
        setPage(p => Math.min(totalPages, p + 1));
    }, [totalPages]);

    const hasPrevPage = validPage > 1;
    const hasNextPage = validPage < totalPages;

    return {
        page: validPage,
        setPage,
        totalPages,
        paginatedItems,
        search,
        setSearch,
        filteredCount: filteredItems.length,
        prevPage,
        nextPage,
        hasPrevPage,
        hasNextPage
    };
}
