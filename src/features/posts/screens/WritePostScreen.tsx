import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import ROUTES from '../../../shared/constants/routes';
import Button from '../../../shared/components/Button/Button';
import Input from '../../../shared/components/Input/Input';
import { useCategories, useCreateCategory, useCreatePost } from '../hooks/postHooks';

export const WritePostScreen = ({ navigation }: any) => {
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  
  // Modals state
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isCreateCategoryModalVisible, setIsCreateCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  
  // Mode selection (Edit vs Preview)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  
  // Selection tracking for markdown formatting insertion
  const [textSelection, setTextSelection] = useState({ start: 0, end: 0 });
  const inputRef = useRef<TextInput>(null);

  // Fetch Categories hook
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  // Create Category Mutation hook
  const createCategoryMutation = useCreateCategory();

  // Create Post Mutation hook
  const createPostMutation = useCreatePost();

  // Handle Image Selection
  const selectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          setImageUri(asset.uri || null);
          setImageFile({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || 'post-image.jpg',
          });
        }
      }
    );
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Category name is required.');
      return;
    }
    createCategoryMutation.mutate(
      {
        categoryName: newCategoryName.trim(),
        description: newCategoryDesc.trim(),
      },
      {
        onSuccess: (data) => {
          Alert.alert('Success', 'Category created successfully!');
          // Automatically select the newly created category returned by the backend
          if (data && data.categoryCreated) {
            setSelectedCategory(data.categoryCreated);
          }
          // Clear inputs and close modal
          setNewCategoryName('');
          setNewCategoryDesc('');
          setIsCreateCategoryModalVisible(false);
        },
        onError: (err: any) => {
          Alert.alert('Error', err.response?.data?.message || 'Failed to create category.');
        },
      }
    );
  };

  const handlePublish = () => {
    if (!selectedCategory) {
      Alert.alert('Validation Error', 'Please select a category.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Post content description cannot be empty.');
      return;
    }

    const formData = new FormData();
    formData.append('description', description.trim());
    formData.append('category', selectedCategory.id.toString());
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    createPostMutation.mutate(formData, {
      onSuccess: () => {
        Alert.alert('Success', 'Post published successfully!');
        // Reset State
        setDescription('');
        setSelectedCategory(null);
        setImageUri(null);
        setImageFile(null);
        // Navigate to Home tab
        navigation.navigate(ROUTES.HOME);
      },
      onError: (err: any) => {
        Alert.alert('Error', err.response?.data?.message || 'Failed to publish post. Please check user status and tier.');
      },
    });
  };

  // Helper to insert Markdown Tag
  const insertMarkdownTag = (tagOpen: string, tagClose: string = '') => {
    const start = textSelection.start;
    const end = textSelection.end;
    
    const selectedText = description.substring(start, end);
    const beforeText = description.substring(0, start);
    const afterText = description.substring(end);
    
    const newText = `${beforeText}${tagOpen}${selectedText}${tagClose}${afterText}`;
    setDescription(newText);
    
    // Return focus to input and position cursor
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Custom Markdown Live Renderer
  const renderMarkdown = (text: string) => {
    if (!text.trim()) {
      return <Text style={styles.placeholderPreview}>No content written yet. Tap 'Edit' to compose!</Text>;
    }
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <Text key={index} style={styles.mdHeader1}>{line.slice(2)}</Text>;
      }
      if (line.startsWith('## ')) {
        return <Text key={index} style={styles.mdHeader2}>{line.slice(3)}</Text>;
      }
      if (line.startsWith('### ')) {
        return <Text key={index} style={styles.mdHeader3}>{line.slice(4)}</Text>;
      }
      
      // Bullet List
      if (line.startsWith('- ')) {
        return (
          <View key={index} style={styles.mdListItem}>
            <Text style={styles.mdBullet}>• </Text>
            <Text style={styles.mdListText}>{line.slice(2)}</Text>
          </View>
        );
      }

      // Formatting: Bold (**text**), Italic (*text*), Links ([text](url))
      const parts: any[] = [];
      let currentText = line;
      let match;
      const regex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g;
      
      let keyIdx = 0;
      while ((match = regex.exec(currentText)) !== null) {
        const matchText = match[0];
        const matchIndex = match.index;
        
        // Text before match
        if (matchIndex > 0) {
          parts.push(<Text key={`text-${keyIdx++}`}>{currentText.slice(0, matchIndex)}</Text>);
        }
        
        // Match styling
        if (matchText.startsWith('**') && matchText.endsWith('**')) {
          parts.push(
            <Text key={`bold-${keyIdx++}`} style={styles.mdBold}>
              {matchText.slice(2, -2)}
            </Text>
          );
        } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
          parts.push(
            <Text key={`italic-${keyIdx++}`} style={styles.mdItalic}>
              {matchText.slice(1, -1)}
            </Text>
          );
        } else if (matchText.startsWith('[') && matchText.includes('](')) {
          const textEnd = matchText.indexOf(']');
          const urlStart = matchText.indexOf('(');
          const linkText = matchText.slice(1, textEnd);
          parts.push(
            <Text key={`link-${keyIdx++}`} style={styles.mdLink}>
              {linkText}
            </Text>
          );
        }
        
        currentText = currentText.slice(matchIndex + matchText.length);
        regex.lastIndex = 0;
      }
      
      if (currentText.length > 0) {
        parts.push(<Text key={`text-end-${index}`}>{currentText}</Text>);
      }
      
      return (
        <Text key={index} style={styles.mdParagraph}>
          {parts.length > 0 ? parts : line}
        </Text>
      );
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>Create Post</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'edit' && styles.activeTab]}
          onPress={() => setActiveTab('edit')}
        >
          <Text style={[styles.tabText, activeTab === 'edit' && styles.activeTabText]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'preview' && styles.activeTab]}
          onPress={() => setActiveTab('preview')}
        >
          <Text style={[styles.tabText, activeTab === 'preview' && styles.activeTabText]}>Preview</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {activeTab === 'edit' ? (
          <View style={styles.formContainer}>
            {/* Category Selector */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              <TouchableOpacity
                style={styles.selectorBtn}
                onPress={() => setIsCategoryModalVisible(true)}
              >
                <Text style={[styles.selectorBtnText, !selectedCategory && styles.placeholderText]}>
                  {selectedCategory ? selectedCategory.categoryName : 'Select a Category'}
                </Text>
                <Text style={styles.arrowDown}>▼</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addCategoryBtn}
                onPress={() => setIsCreateCategoryModalVisible(true)}
              >
                <Text style={styles.addCategoryBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Cover Image */}
            <Text style={styles.label}>Cover Image</Text>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <View style={styles.imageActions}>
                  <TouchableOpacity style={styles.changeImgBtn} onPress={selectImage}>
                    <Text style={styles.imageActionsText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeImgBtn}
                    onPress={() => {
                      setImageUri(null);
                      setImageFile(null);
                    }}
                  >
                    <Text style={styles.imageActionsText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadBox} onPress={selectImage}>
                <Text style={styles.uploadEmoji}>🖼️</Text>
                <Text style={styles.uploadText}>Select Cover Image</Text>
              </TouchableOpacity>
            )}

            {/* Description Editor */}
            <Text style={styles.label}>Post Content</Text>
            
            {/* Markdown Helper Toolbar */}
            <View style={styles.toolbar}>
              <TouchableOpacity style={styles.toolbarBtn} onPress={() => insertMarkdownTag('**', '**')}>
                <Text style={styles.toolbarBtnText}>B</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarBtn} onPress={() => insertMarkdownTag('*', '*')}>
                <Text style={[styles.toolbarBtnText, { fontStyle: 'italic' }]}>I</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarBtn} onPress={() => insertMarkdownTag('# ')}>
                <Text style={styles.toolbarBtnText}>H1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarBtn} onPress={() => insertMarkdownTag('## ')}>
                <Text style={styles.toolbarBtnText}>H2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarBtn} onPress={() => insertMarkdownTag('- ')}>
                <Text style={styles.toolbarBtnText}>• List</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarBtn} onPress={() => insertMarkdownTag('[text](url)')}>
                <Text style={styles.toolbarBtnText}>🔗 Link</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              ref={inputRef}
              style={styles.textArea}
              placeholder="Start writing in rich markdown format..."
              multiline={true}
              value={description}
              onChangeText={setDescription}
              onSelectionChange={(e) => setTextSelection(e.nativeEvent.selection)}
              textAlignVertical="top"
              placeholderTextColor={COLORS.textLightSecondary}
            />

            <Button
              title="Publish Post"
              onPress={handlePublish}
              isLoading={createPostMutation.isPending}
              style={styles.publishBtn}
            />
          </View>
        ) : (
          <View style={styles.previewCard}>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            )}
            <View style={styles.previewMeta}>
              <Text style={styles.previewCategory}>
                📁 {selectedCategory ? selectedCategory.categoryName : 'Uncategorized'}
              </Text>
            </View>
            <View style={styles.previewContent}>
              {renderMarkdown(description)}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Select Category Modal */}
      <Modal
        visible={isCategoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsCategoryModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              
              {isLoadingCategories ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ margin: SPACING.lg }} />
              ) : categories.length === 0 ? (
                <Text style={styles.noCategoriesText}>No categories found. Click "+" to create one.</Text>
              ) : (
                <ScrollView style={styles.categoryList}>
                  {categories.map((cat: any) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryItem,
                        selectedCategory?.id === cat.id && styles.categoryItemActive,
                      ]}
                      onPress={() => {
                        setSelectedCategory(cat);
                        setIsCategoryModalVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryItemText,
                          selectedCategory?.id === cat.id && styles.categoryItemTextActive,
                        ]}
                      >
                        {cat.categoryName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Button
                title="Close"
                onPress={() => setIsCategoryModalVisible(false)}
                variant="outline"
                style={styles.modalCloseBtn}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Create Category Modal */}
      <Modal
        visible={isCreateCategoryModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsCreateCategoryModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Category</Text>
            
            <Input
              label="Category Name"
              placeholder="e.g. Technology"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />

            <Input
              label="Description (Optional)"
              placeholder="e.g. Articles about tech and coding"
              value={newCategoryDesc}
              onChangeText={setNewCategoryDesc}
            />

            <Button
              title="Create Category"
              onPress={handleCreateCategory}
              isLoading={createCategoryMutation.isPending}
              style={styles.modalSubmitBtn}
            />

            <Button
              title="Cancel"
              onPress={() => setIsCreateCategoryModalVisible(false)}
              variant="outline"
              style={styles.modalCloseBtn}
              disabled={createCategoryMutation.isPending}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  navBar: {
    height: 56,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  navTitle: {
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
  formContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  selectorBtn: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  selectorBtnText: {
    fontSize: 15,
    color: COLORS.textLightPrimary,
    fontWeight: '500',
  },
  placeholderText: {
    color: COLORS.textLightSecondary,
  },
  arrowDown: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
  },
  addCategoryBtn: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCategoryBtnText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '600',
  },
  uploadBox: {
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  uploadEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  uploadText: {
    color: COLORS.textLightSecondary,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  imagePreview: {
    height: 150,
    borderRadius: 8,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  changeImgBtn: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  removeImgBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  imageActionsText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLightPrimary,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderBottomWidth: 0,
    padding: SPACING.xs,
    gap: SPACING.xs,
  },
  toolbarBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  toolbarBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  textArea: {
    height: 250,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textLightPrimary,
  },
  publishBtn: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: SPACING.xl,
  },
  previewImage: {
    height: 180,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  previewMeta: {
    marginBottom: SPACING.md,
  },
  previewCategory: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  previewContent: {
    paddingBottom: SPACING.xl,
  },
  placeholderPreview: {
    color: COLORS.textLightSecondary,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: SPACING.xl,
  },
  mdHeader1: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  mdHeader2: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  mdHeader3: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  mdListItem: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingLeft: SPACING.sm,
  },
  mdBullet: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },
  mdListText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textLightPrimary,
  },
  mdParagraph: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textLightPrimary,
    marginVertical: 4,
  },
  mdBold: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  mdItalic: {
    fontStyle: 'italic',
  },
  mdLink: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '80%',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  categoryList: {
    maxHeight: 300,
    marginBottom: SPACING.md,
  },
  categoryItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    alignItems: 'center',
  },
  categoryItemActive: {
    backgroundColor: COLORS.backgroundLight,
  },
  categoryItemText: {
    fontSize: 16,
    color: COLORS.textLightPrimary,
    fontWeight: '500',
  },
  categoryItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  noCategoriesText: {
    color: COLORS.textLightSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginVertical: SPACING.lg,
  },
  modalCloseBtn: {
    marginTop: SPACING.sm,
    borderColor: COLORS.borderLight,
  },
  modalSubmitBtn: {
    marginTop: SPACING.md,
  },
});

export default WritePostScreen;
