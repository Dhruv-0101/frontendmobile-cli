import React from 'react';
import {
  FlatList,
  FlatListProps,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import EmptyState from '../empty/EmptyState';
import ErrorState from '../error/ErrorState';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';

interface InfiniteFlatListProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement | null;
  infiniteQueryResult: any; // Result from useInfiniteQuery
  dataExtractor?: (page: any) => T[];
  SkeletonComponent: React.ComponentType;
  skeletonCount?: number;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyIcon?: string;
  emptyButtonText?: string;
  onEmptyButtonPress?: () => void;
  containerStyle?: ViewStyle;
}

export function InfiniteFlatList<T>({
  renderItem,
  infiniteQueryResult,
  dataExtractor,
  SkeletonComponent,
  skeletonCount = 5,
  emptyTitle = 'No items found',
  emptySubtitle,
  emptyIcon = '📭',
  emptyButtonText,
  onEmptyButtonPress,
  containerStyle,
  ...flatListProps
}: InfiniteFlatListProps<T>) {
  const {
    items,
    isLoading,
    isRefreshing,
    isFetchingNextPage,
    onRefresh,
    onLoadMore,
    isError,
    error,
    isEmpty,
    refetch,
  } = useInfiniteScroll(infiniteQueryResult, dataExtractor);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={COLORS.secondary} />
      </View>
    );
  };

  if (isLoading) {
    // Show a list of skeletons
    const skeletons = Array(skeletonCount).fill(0);
    return (
      <FlatList
        data={skeletons}
        keyExtractor={(_, index) => `skeleton-${index}`}
        renderItem={() => <SkeletonComponent />}
        contentContainerStyle={[styles.listContainer, flatListProps.contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  if (isError && items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ErrorState error={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <FlatList
      data={items as T[]}
      renderItem={renderItem}
      keyExtractor={flatListProps.keyExtractor || ((item: any) => item.id?.toString() || item.key)}
      contentContainerStyle={[styles.listContainer, flatListProps.contentContainerStyle]}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        <EmptyState
          title={emptyTitle}
          subtitle={emptySubtitle}
          icon={emptyIcon}
          buttonText={emptyButtonText}
          onPress={onEmptyButtonPress}
        />
      }
      // Performance Optimizations
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      updateCellsBatchingPeriod={50}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: SPACING.xl,
  },
  footerContainer: {
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
});

export default InfiniteFlatList;
