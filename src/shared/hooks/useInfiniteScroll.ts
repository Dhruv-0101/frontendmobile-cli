import { useMemo, useCallback } from 'react';

export const useInfiniteScroll = (infiniteQueryResult: any, dataExtractor?: (page: any) => any[]) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
    isError,
    error,
  } = infiniteQueryResult;

  const items = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page: any) => {
      if (dataExtractor) return dataExtractor(page);
      // Default extractions based on common API response objects
      return (
        page.posts ||
        page.data ||
        page.items ||
        page.followers ||
        page.following ||
        page.notifications ||
        page.rankings ||
        (Array.isArray(page) ? page : [])
      );
    });
  }, [data, dataExtractor]);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const onLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isError) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  const isEmpty = items.length === 0 && !isLoading;

  return {
    items,
    isLoading,
    isRefreshing: infiniteQueryResult.isRefetching && !isFetchingNextPage,
    isFetchingNextPage,
    hasNextPage,
    onRefresh,
    onLoadMore,
    isError,
    error,
    isEmpty,
    refetch,
  };
};

export default useInfiniteScroll;
