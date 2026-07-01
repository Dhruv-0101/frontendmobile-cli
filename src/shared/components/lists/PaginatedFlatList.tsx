import React from 'react';
import {
  FlatList,
  FlatListProps,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import EmptyState from '../empty/EmptyState';
import ErrorState from '../error/ErrorState';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';

interface PaginatedFlatListProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  SkeletonComponent: React.ComponentType;
  skeletonCount?: number;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyIcon?: string;
  emptyButtonText?: string;
  onEmptyButtonPress?: () => void;
}

export function PaginatedFlatList<T>({
  data,
  renderItem,
  isLoading,
  isRefreshing,
  isError,
  error,
  refetch,
  page,
  totalPages,
  onPageChange,
  SkeletonComponent,
  skeletonCount = 5,
  emptyTitle = 'No items found',
  emptySubtitle,
  emptyIcon = '📭',
  emptyButtonText,
  onEmptyButtonPress,
  ...flatListProps
}: PaginatedFlatListProps<T>) {

  const renderPaginationFooter = () => {
    if (totalPages <= 1) return null;
    return (
      <View style={styles.paginationRow}>
        <TouchableOpacity
          style={[styles.pageBtn, page <= 1 && styles.disabledBtn]}
          disabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
        >
          <Text style={[styles.pageBtnText, page <= 1 && styles.disabledText]}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.pageIndicator}>
          Page {page} of {totalPages}
        </Text>
        <TouchableOpacity
          style={[styles.pageBtn, page >= totalPages && styles.disabledBtn]}
          disabled={page >= totalPages}
          onPress={() => onPageChange(page + 1)}
        >
          <Text style={[styles.pageBtnText, page >= totalPages && styles.disabledText]}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
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

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <ErrorState error={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={flatListProps.keyExtractor || ((item: any) => item.id?.toString() || item.key)}
      contentContainerStyle={[styles.listContainer, flatListProps.contentContainerStyle]}
      onRefresh={refetch}
      refreshing={isRefreshing}
      ListFooterComponent={renderPaginationFooter}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  pageBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  disabledBtn: {
    backgroundColor: COLORS.borderLight,
  },
  pageBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
  },
  disabledText: {
    color: COLORS.textLightSecondary,
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
  },
});

export default PaginatedFlatList;
