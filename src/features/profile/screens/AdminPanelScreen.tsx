import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import Button from '../../../shared/components/Button/Button';
import Input from '../../../shared/components/Input/Input';
import { useCreateCategory } from '../../posts/hooks/postHooks';
import { useCreatePlan } from '../hooks/adminHooks';

export const AdminPanelScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'category' | 'plan'>('category');

  // Category State
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  // Plan State
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planFeatures, setPlanFeatures] = useState('');

  // Mutations
  const createCategoryMutation = useCreateCategory();
  const createPlanMutation = useCreatePlan();

  const handleCreateCategory = () => {
    if (!categoryName.trim()) {
      Alert.alert('Validation Error', 'Category Name is required.');
      return;
    }

    createCategoryMutation.mutate(
      {
        categoryName: categoryName.trim(),
        description: categoryDesc.trim(),
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'New category created successfully!');
          setCategoryName('');
          setCategoryDesc('');
        },
        onError: (err: any) => {
          Alert.alert('Error', err.response?.data?.message || 'Failed to create category.');
        },
      }
    );
  };

  const handleCreatePlan = () => {
    if (!planName.trim()) {
      Alert.alert('Validation Error', 'Plan Name is required.');
      return;
    }
    if (!planPrice.trim() || isNaN(Number(planPrice))) {
      Alert.alert('Validation Error', 'Please enter a valid plan price.');
      return;
    }
    if (!planFeatures.trim()) {
      Alert.alert('Validation Error', 'At least one plan feature is required.');
      return;
    }

    createPlanMutation.mutate(
      {
        planName: planName.trim(),
        price: Number(planPrice),
        features: planFeatures.trim(),
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Premium subscription plan created successfully!');
          setPlanName('');
          setPlanPrice('');
          setPlanFeatures('');
        },
        onError: (err: any) => {
          Alert.alert('Error', err.response?.data?.message || 'Failed to create plan.');
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Control Panel</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'category' && styles.activeTab]}
          onPress={() => setActiveTab('category')}
        >
          <Text style={[styles.tabText, activeTab === 'category' && styles.activeTabText]}>
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'plan' && styles.activeTab]}
          onPress={() => setActiveTab('plan')}
        >
          <Text style={[styles.tabText, activeTab === 'plan' && styles.activeTabText]}>
            Subscription Plans
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {activeTab === 'category' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create New Category</Text>
            <Text style={styles.cardSubtitle}>
              Create a new category for articles. This will immediately show up in users dropdown when writing posts.
            </Text>

            <Input
              label="Category Name"
              placeholder="e.g. Science, Health, Travel"
              value={categoryName}
              onChangeText={setCategoryName}
            />

            <Input
              label="Description (Optional)"
              placeholder="Provide a short description of this category..."
              value={categoryDesc}
              onChangeText={setCategoryDesc}
              multiline={true}
              numberOfLines={3}
            />

            <Button
              title="Save Category"
              onPress={handleCreateCategory}
              isLoading={createCategoryMutation.isPending}
              style={styles.actionBtn}
            />
          </View>
        )}

        {activeTab === 'plan' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Subscription Plan</Text>
            <Text style={styles.cardSubtitle}>
              Create premium subscription packages for content monetisation.
            </Text>

            <Input
              label="Plan Name"
              placeholder="e.g. Gold Tier, Platinum Package"
              value={planName}
              onChangeText={setPlanName}
            />

            <Input
              label="Price (USD Monthly)"
              placeholder="e.g. 9.99, 19.99"
              value={planPrice}
              onChangeText={setPlanPrice}
              keyboardType="numeric"
            />

            <Input
              label="Plan Features (Comma separated)"
              placeholder="e.g. Unlimited posts, Custom badges, Ad-free reading"
              value={planFeatures}
              onChangeText={setPlanFeatures}
              multiline={true}
              numberOfLines={3}
              helperText="Separate features using commas so they show as bullet items."
            />

            <Button
              title="Create Plan"
              onPress={handleCreatePlan}
              isLoading={createPlanMutation.isPending}
              style={styles.actionBtn}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  headerBar: {
    height: 56,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLightSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContainer: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: SPACING.xl,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textLightSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: SPACING.md,
  },
});

export default AdminPanelScreen;
