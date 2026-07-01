import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import ROUTES from '../../../shared/constants/routes';
import { useNotifications, useMarkNotificationRead } from '../hooks/profileHooks';
import { formatDate } from '../../../shared/utils/date';
import EmptyState from '../../../shared/components/empty/EmptyState';
import { NotificationSkeleton } from '../../../shared/components/skeleton';

export const NotificationsScreen = ({ navigation }: any) => {
  const { data: notifData, isLoading, refetch, isRefetching } = useNotifications();
  const markReadMutation = useMarkNotificationRead();

  const notifications = notifData?.notifications || [];

  const handleNotificationPress = useCallback((notif: any) => {
    // 1. Mark notification as read
    markReadMutation.mutate(Number(notif.id), {
      onSuccess: () => {
        // 2. If it is linked to a post, navigate to post details
        if (notif.postId) {
          navigation.navigate(ROUTES.POST_DETAILS, { postId: notif.postId });
        } else {
          refetch();
        }
      },
      onError: (err: any) => {
        console.error('Failed to mark notification as read:', err);
      },
    });
  }, [navigation, refetch]);

  const handleMarkAllRead = () => {
    if (notifications.length === 0) return;
    
    // Iterate over unread notifications and mark them read
    Alert.alert('Mark All Read', 'Clear all unread notifications?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            for (const notif of notifications) {
              await markReadMutation.mutateAsync(Number(notif.id));
            }
            Alert.alert('Success', 'All notifications cleared.');
            refetch();
          } catch (err) {
            console.error(err);
          }
        },
      },
    ]);
  };

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      // Strip HTML tags from database message to display clean text in React Native
      const cleanMessage = item.message ? item.message.replace(/<[^>]*>?/gm, '') : '';
      
      return (
        <TouchableOpacity
          style={styles.notifCard}
          activeOpacity={0.8}
          onPress={() => handleNotificationPress(item)}
        >
          <View style={styles.notifHeader}>
            <Text style={styles.notifEmoji}>📢</Text>
            <Text style={styles.notifDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text style={styles.notifMessage}>{cleanMessage}</Text>
          {item.postId && (
            <Text style={styles.viewPostLink}>Tap to view post →</Text>
          )}
        </TouchableOpacity>
      );
    },
    [handleNotificationPress]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          onPress={handleMarkAllRead} 
          disabled={notifications.length === 0}
          style={styles.clearBtn}
        >
          <Text style={[styles.clearBtnText, notifications.length === 0 && styles.disabledText]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <FlatList
            data={Array(5).fill(0)}
            keyExtractor={(_, index) => `skeleton-${index}`}
            renderItem={() => <NotificationSkeleton />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            onRefresh={refetch}
            refreshing={isRefetching}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                title="All caught up!"
                subtitle="You have no unread notifications. New notifications about followed creators will appear here."
                icon="🔔"
              />
            }
            // Optimizations
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            updateCellsBatchingPeriod={50}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    padding: SPACING.sm,
    width: 40,
    alignItems: 'flex-start',
  },
  backBtnText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
  },
  clearBtn: {
    padding: SPACING.sm,
  },
  clearBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  disabledText: {
    color: COLORS.textLightSecondary,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textLightSecondary,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 120,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textLightSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  emptyStateSub: {
    fontSize: 13,
    color: COLORS.textLightSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  notifCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notifEmoji: {
    fontSize: 16,
  },
  notifDate: {
    fontSize: 11,
    color: COLORS.textLightSecondary,
  },
  notifMessage: {
    fontSize: 14,
    color: COLORS.textLightPrimary,
    lineHeight: 20,
  },
  viewPostLink: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
});

export default NotificationsScreen;
