import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  StatusBar,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { RichEditor, actions } from 'react-native-pell-rich-editor';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import ROUTES from '../../../shared/constants/routes';
import Button from '../../../shared/components/Button/Button';
import Input from '../../../shared/components/Input/Input';
import { useCategories, useCreatePost } from '../hooks/postHooks';
import { storage } from '../../../services/storage';
import { useAppSelector } from '../../../store/hooks';
import TopHeader from '../../../shared/components/TopHeader/TopHeader';

export const WritePostScreen = ({ navigation }: any) => {
  const user = useAppSelector((state) => state.auth.user);

  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);

  // Drafts & navigation tab state
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);

  // Modals and toolbar states
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  const [isHeadingMenuVisible, setIsHeadingMenuVisible] = useState(false);
  const [currentHeading, setCurrentHeading] = useState(0); // 0 = Normal, 1 = H1, 2 = H2, 3 = H3

  // Link input states
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Rich editor reference
  const richTextRef = useRef<RichEditor>(null);

  // Fetch Categories query
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  // Create Post mutation hook
  const createPostMutation = useCreatePost();

  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    const drafts = await storage.getDrafts();
    setSavedDrafts(drafts);
  };

  // Handle image picker
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

  // Draft Actions
  const handleSaveDraft = async () => {
    if (!description.trim() && !selectedCategory && !imageUri) {
      Alert.alert('Empty Post', 'Please write some content or select a category before saving a draft.');
      return;
    }

    const draftId = loadedDraftId || Date.now().toString();
    const newDraft = {
      id: draftId,
      description,
      selectedCategory,
      imageUri,
      imageFile,
      createdAt: new Date().toISOString(),
    };

    await storage.saveDraft(newDraft);
    
    // Clear the editor fields after saving the draft
    setDescription('');
    setSelectedCategory(null);
    setImageUri(null);
    setImageFile(null);
    setLoadedDraftId(null);
    richTextRef.current?.setContentHTML('');

    await loadDrafts();
    Alert.alert('Success', 'Draft saved locally!');
  };

  const handleLoadDraft = (draft: any) => {
    setDescription(draft.description);
    setSelectedCategory(draft.selectedCategory);
    setImageUri(draft.imageUri);
    setImageFile(draft.imageFile);
    setLoadedDraftId(draft.id);

    // Set editor content
    richTextRef.current?.setContentHTML(draft.description);
    
    // Switch to edit tab
    setActiveTab('edit');
    Alert.alert('Loaded', 'Draft restored to editor.');
  };

  const handleDeleteDraft = (draftId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this draft?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storage.deleteDraft(draftId);
            if (loadedDraftId === draftId) {
              setLoadedDraftId(null);
            }
            await loadDrafts();
          },
        },
      ]
    );
  };

  // Backend Publish Action
  const handlePublish = () => {
    if (!user?.hasSelectedPlan) {
      Alert.alert(
        'Subscription Required',
        'You must purchase a premium subscription plan before you can publish stories.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'View Plans',
            onPress: () => navigation.navigate(ROUTES.PLANS_PURCHASE),
          },
        ]
      );
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Validation Error', 'Please select a category.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Post content cannot be empty.');
      return;
    }

    const formData = new FormData();
    formData.append('description', description.trim());
    formData.append('category', selectedCategory.id.toString());

    if (imageFile) {
      formData.append('image', imageFile);
    }

    createPostMutation.mutate(formData, {
      onSuccess: async () => {
        Alert.alert('Success', 'Post published successfully!');

        // If this post was created from a draft, delete the draft now
        if (loadedDraftId) {
          await storage.deleteDraft(loadedDraftId);
        }

        // Reset state
        setDescription('');
        setSelectedCategory(null);
        setImageUri(null);
        setImageFile(null);
        setLoadedDraftId(null);
        richTextRef.current?.setContentHTML('');
        await loadDrafts();

        // Navigate to feed
        navigation.navigate(ROUTES.HOME);
      },
      onError: (err: any) => {
        Alert.alert(
          'Error',
          err.response?.data?.message || 'Failed to publish post. Please check user status and tier.'
        );
      },
    });
  };

  // Custom Inline HTML Parser for Preview Tab
  const renderHtml = (htmlText: string) => {
    if (!htmlText || !htmlText.trim()) {
      return <Text style={styles.placeholderPreview}>No content written yet. Tap 'Edit' to compose!</Text>;
    }

    // Replace linebreaks and parse standard block HTML tags
    const blocks = htmlText
      .replace(/<br\s*\/?>/gi, '\n')
      .split(/(<h1>.*?<\/h1>|<h2>.*?<\/h2>|<h3>.*?<\/h3>|<li>.*?<\/li>|<p>.*?<\/p>|<div>.*?<\/div>)/gi)
      .filter(Boolean);

    return blocks.map((block, index) => {
      const cleanBlock = block.trim();
      if (!cleanBlock) return null;

      // H1 Tag
      if (/^<h1>(.*?)<\/h1>$/i.test(cleanBlock)) {
        const match = cleanBlock.match(/^<h1>(.*?)<\/h1>$/i);
        return <Text key={index} style={styles.mdHeader1}>{parseInlineHtml(match?.[1] || '')}</Text>;
      }
      // H2 Tag
      if (/^<h2>(.*?)<\/h2>$/i.test(cleanBlock)) {
        const match = cleanBlock.match(/^<h2>(.*?)<\/h2>$/i);
        return <Text key={index} style={styles.mdHeader2}>{parseInlineHtml(match?.[1] || '')}</Text>;
      }
      // H3 Tag
      if (/^<h3>(.*?)<\/h3>$/i.test(cleanBlock)) {
        const match = cleanBlock.match(/^<h3>(.*?)<\/h3>$/i);
        return <Text key={index} style={styles.mdHeader3}>{parseInlineHtml(match?.[1] || '')}</Text>;
      }
      // List Item Tag
      if (/^<li>(.*?)<\/li>$/i.test(cleanBlock)) {
        const match = cleanBlock.match(/^<li>(.*?)<\/li>$/i);
        return (
          <View key={index} style={styles.mdListItem}>
            <Text style={styles.mdBullet}>• </Text>
            <Text style={styles.mdListText}>{parseInlineHtml(match?.[1] || '')}</Text>
          </View>
        );
      }

      // Paragraph / Div tag stripping
      const isPara = /^<p>(.*?)<\/p>$/i.test(cleanBlock);
      const isDiv = /^<div>(.*?)<\/div>$/i.test(cleanBlock);
      let content = cleanBlock;
      if (isPara) content = cleanBlock.match(/^<p>(.*?)<\/p>$/i)?.[1] || '';
      if (isDiv) content = cleanBlock.match(/^<div>(.*?)<\/div>$/i)?.[1] || '';

      if (content.startsWith('<') && content.endsWith('>')) {
        return null; // Skip raw structural tags
      }

      return (
        <Text key={index} style={styles.mdParagraph}>
          {parseInlineHtml(content)}
        </Text>
      );
    });
  };

  const parseInlineHtml = (text: string) => {
    const parts: any[] = [];
    let currentText = text;
    let match;
    const regex = /(<b>.*?<\/b>|<strong>.*?<\/strong>|<i>.*?<\/i>|<em>.*?<\/em>|<u>.*?<\/u>|<a href=".*?">.*?<\/a>)/gi;

    let keyIdx = 0;
    while ((match = regex.exec(currentText)) !== null) {
      const matchText = match[0];
      const matchIndex = match.index;

      if (matchIndex > 0) {
        parts.push(<Text key={`text-${keyIdx++}`}>{currentText.slice(0, matchIndex).replace(/<[^>]*>?/gm, '')}</Text>);
      }

      if (/^<b>(.*?)<\/b>$/i.test(matchText) || /^<strong>(.*?)<\/strong>$/i.test(matchText)) {
        const innerText = matchText.replace(/<[^>]*>?/gm, '');
        parts.push(<Text key={`bold-${keyIdx++}`} style={styles.mdBold}>{innerText}</Text>);
      } else if (/^<i>(.*?)<\/i>$/i.test(matchText) || /^<em>(.*?)<\/em>$/i.test(matchText)) {
        const innerText = matchText.replace(/<[^>]*>?/gm, '');
        parts.push(<Text key={`italic-${keyIdx++}`} style={styles.mdItalic}>{innerText}</Text>);
      } else if (/^<u>(.*?)<\/u>$/i.test(matchText)) {
        const innerText = matchText.replace(/<[^>]*>?/gm, '');
        parts.push(<Text key={`underline-${keyIdx++}`} style={styles.mdUnderline}>{innerText}</Text>);
      } else if (/^<a href="(.*?)">(.*?)<\/a>$/i.test(matchText)) {
        const matchHref = matchText.match(/^<a href="(.*?)">(.*?)<\/a>$/i);
        const linkText = matchHref?.[2] || '';
        parts.push(<Text key={`link-${keyIdx++}`} style={styles.mdLink}>{linkText}</Text>);
      }

      currentText = currentText.slice(matchIndex + matchText.length);
      regex.lastIndex = 0;
    }

    if (currentText.length > 0) {
      parts.push(<Text key={`text-end-${keyIdx++}`}>{currentText.replace(/<[^>]*>?/gm, '')}</Text>);
    }

    return parts.length > 0 ? parts : text.replace(/<[^>]*>?/gm, '');
  };

  // Strip HTML for draft descriptions snippets
  const stripHtml = (html: string) => {
    return html ? html.replace(/<[^>]*>?/gm, '') : '';
  };

  const handleInsertLink = () => {
    setLinkTitle('');
    setLinkUrl('');
    setIsLinkModalVisible(true);
  };

  const submitLink = () => {
    if (linkUrl) {
      richTextRef.current?.insertLink(linkTitle || linkUrl, linkUrl);
    }
    setIsLinkModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TopHeader />

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
          <Text style={[styles.tabText, activeTab === 'preview' && styles.activeTabText]}>Preview & Drafts</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* EDIT VIEW */}
        <View style={{ display: activeTab === 'edit' ? 'flex' : 'none' }}>
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

            {/* Rich Editor Custom Toolbar */}
            <View style={styles.toolbarContainer}>
              <View style={styles.toolbarRow}>
                {/* Heading Dropdown */}
                <TouchableOpacity
                  style={styles.headingDropdown}
                  onPress={() => setIsHeadingMenuVisible(!isHeadingMenuVisible)}
                >
                  <Text style={styles.headingDropdownText}>
                    {currentHeading === 1
                      ? 'Heading 1'
                      : currentHeading === 2
                      ? 'Heading 2'
                      : currentHeading === 3
                      ? 'Heading 3'
                      : 'Normal'}
                  </Text>
                  <Text style={styles.arrowDown}>▼</Text>
                </TouchableOpacity>

                {/* Styled format buttons */}
                <TouchableOpacity style={styles.toolbarBtn} onPress={() => richTextRef.current?.sendAction(actions.setBold, 'result')}>
                  <Text style={styles.toolbarBtnBold}>B</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn} onPress={() => richTextRef.current?.sendAction(actions.setItalic, 'result')}>
                  <Text style={styles.toolbarBtnItalic}>I</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn} onPress={() => richTextRef.current?.sendAction(actions.setUnderline, 'result')}>
                  <Text style={styles.toolbarBtnUnderline}>U</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn} onPress={handleInsertLink}>
                  <Text style={styles.toolbarBtnText}>🔗</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn} onPress={() => richTextRef.current?.sendAction(actions.insertOrderedList, 'result')}>
                  <Text style={styles.toolbarBtnText}>1.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn} onPress={() => richTextRef.current?.sendAction(actions.insertBulletsList, 'result')}>
                  <Text style={styles.toolbarBtnText}>•</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn} onPress={() => richTextRef.current?.sendAction(actions.removeFormat, 'result')}>
                  <Text style={styles.toolbarBtnTextClear}>Tx</Text>
                </TouchableOpacity>
              </View>

              {/* Absolute Popover Heading Menu */}
              {isHeadingMenuVisible && (
                <View style={styles.headingMenu}>
                  <TouchableOpacity
                    style={styles.headingMenuItem}
                    onPress={() => {
                      richTextRef.current?.sendAction(actions.setParagraph, 'result');
                      setCurrentHeading(0);
                      setIsHeadingMenuVisible(false);
                    }}
                  >
                    <Text style={styles.headingMenuItemText}>Normal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headingMenuItem}
                    onPress={() => {
                      richTextRef.current?.sendAction(actions.heading1, 'result');
                      setCurrentHeading(1);
                      setIsHeadingMenuVisible(false);
                    }}
                  >
                    <Text style={[styles.headingMenuItemText, { fontSize: 18, fontWeight: '700' }]}>Heading 1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headingMenuItem}
                    onPress={() => {
                      richTextRef.current?.sendAction(actions.heading2, 'result');
                      setCurrentHeading(2);
                      setIsHeadingMenuVisible(false);
                    }}
                  >
                    <Text style={[styles.headingMenuItemText, { fontSize: 16, fontWeight: '700' }]}>Heading 2</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headingMenuItem}
                    onPress={() => {
                      richTextRef.current?.sendAction(actions.heading3, 'result');
                      setCurrentHeading(3);
                      setIsHeadingMenuVisible(false);
                    }}
                  >
                    <Text style={[styles.headingMenuItemText, { fontSize: 14, fontWeight: '700' }]}>Heading 3</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Pell Rich Text Editor Container */}
            <View style={styles.editorContainer}>
              <RichEditor
                ref={richTextRef}
                initialContentHTML={description}
                onChange={setDescription}
                placeholder="Write your story content here..."
                style={styles.richEditor}
                editorStyle={{
                  backgroundColor: COLORS.white,
                  color: COLORS.textLightPrimary,
                  placeholderColor: COLORS.textLightSecondary,
                  contentCSSText: 'font-size: 15px; line-height: 22px; font-family: Helvetica;',
                }}
              />
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionButtonsContainer}>
              <Button
                title="Save Draft"
                onPress={handleSaveDraft}
                variant="outline"
                style={styles.draftBtn}
              />
              <Button
                title="Publish Post"
                onPress={handlePublish}
                isLoading={createPostMutation.isPending}
                style={styles.publishBtn}
              />
            </View>
          </View>
        </View>

        {/* PREVIEW VIEW */}
        <View style={{ display: activeTab === 'preview' ? 'flex' : 'none' }}>
          {/* Active Post Preview */}
          <Text style={styles.previewSectionTitle}>CURRENT STORY PREVIEW</Text>
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
              {renderHtml(description)}
            </View>
          </View>

          {/* Drafts Section */}
          <Text style={styles.previewSectionTitle}>YOUR SAVED DRAFTS ({savedDrafts.length})</Text>
          {savedDrafts.length === 0 ? (
            <View style={styles.emptyDraftsContainer}>
              <Text style={styles.emptyDraftsText}>No saved drafts found.</Text>
              <Text style={styles.emptyDraftsSubText}>Tap 'Save Draft' in the Edit tab to store posts offline.</Text>
            </View>
          ) : (
            <View style={styles.draftsList}>
              {savedDrafts.map((draft: any) => (
                <View key={draft.id} style={styles.draftCard}>
                  <View style={styles.draftHeaderRow}>
                    <Text style={styles.draftCategory}>
                      📁 {draft.selectedCategory ? draft.selectedCategory.categoryName : 'Uncategorized'}
                    </Text>
                    <Text style={styles.draftDate}>
                      {new Date(draft.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  
                  <View style={styles.draftContentRow}>
                    <View style={styles.draftTextContainer}>
                      <Text style={styles.draftSnippet} numberOfLines={2}>
                        {stripHtml(draft.description) || 'Empty draft contents...'}
                      </Text>
                    </View>
                    {draft.imageUri && (
                      <Image source={{ uri: draft.imageUri }} style={styles.draftThumbnail} />
                    )}
                  </View>

                  <View style={styles.draftActionsRow}>
                    <TouchableOpacity
                      style={[styles.draftActionBtn, styles.draftLoadBtn]}
                      onPress={() => handleLoadDraft(draft)}
                    >
                      <Text style={styles.draftLoadBtnText}>📝 Load Draft</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.draftActionBtn, styles.draftDeleteBtn]}
                      onPress={() => handleDeleteDraft(draft.id)}
                    >
                      <Text style={styles.draftDeleteBtnText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
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
                <Text style={styles.noCategoriesText}>No categories available. Please contact admin.</Text>
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

      {/* Insert Link Modal */}
      <Modal
        visible={isLinkModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsLinkModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsLinkModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Insert Hyperlink</Text>
              
              <Input
                label="Link Text (Optional)"
                placeholder="e.g. Google"
                value={linkTitle}
                onChangeText={setLinkTitle}
              />

              <Input
                label="URL"
                placeholder="e.g. https://google.com"
                value={linkUrl}
                onChangeText={setLinkUrl}
                keyboardType="url"
                autoCapitalize="none"
              />

              <View style={styles.linkModalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setIsLinkModalVisible(false)}
                  variant="outline"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Insert"
                  onPress={submitLink}
                  style={{ flex: 1, marginLeft: SPACING.sm }}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
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
  
  // Toolbar layout matching pell editor screenshot style
  toolbarContainer: {
    position: 'relative',
    zIndex: 10,
  },
  toolbarRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderBottomWidth: 0,
    padding: SPACING.xs,
    alignItems: 'center',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  headingDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    marginRight: SPACING.xs,
    gap: SPACING.xs,
  },
  headingDropdownText: {
    fontSize: 13,
    color: COLORS.textLightPrimary,
    fontWeight: '700',
  },
  toolbarBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 28,
  },
  toolbarBtnText: {
    fontSize: 13,
    color: COLORS.textLightPrimary,
  },
  toolbarBtnBold: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
  },
  toolbarBtnItalic: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '600',
    color: COLORS.textLightPrimary,
  },
  toolbarBtnUnderline: {
    fontSize: 13,
    textDecorationLine: 'underline',
    fontWeight: '600',
    color: COLORS.textLightPrimary,
  },
  toolbarBtnTextClear: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.danger,
  },
  
  // Heading Menu dropdown items
  headingMenu: {
    position: 'absolute',
    top: 38,
    left: 4,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 8,
    padding: SPACING.xs,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 120,
    zIndex: 20,
  },
  headingMenuItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },
  headingMenuItemText: {
    fontSize: 14,
    color: COLORS.textLightPrimary,
  },

  // Editor styling
  editorContainer: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    minHeight: 250,
  },
  richEditor: {
    flex: 1,
    minHeight: 250,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  draftBtn: {
    flex: 1,
    borderColor: COLORS.primary,
  },
  publishBtn: {
    flex: 1.5,
  },

  // Previews & HTML Rendering
  previewSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textLightSecondary,
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
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
    paddingBottom: SPACING.sm,
  },
  placeholderPreview: {
    color: COLORS.textLightSecondary,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: SPACING.xl,
  },
  
  // Custom HTML Tag styles
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
  mdUnderline: {
    textDecorationLine: 'underline',
  },
  mdLink: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },

  // Modal Styles
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
  linkModalButtons: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },

  // Drafts Listing layout
  emptyDraftsContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyDraftsText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
    marginBottom: SPACING.xs,
  },
  emptyDraftsSubText: {
    fontSize: 13,
    color: COLORS.textLightSecondary,
    textAlign: 'center',
  },
  draftsList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  draftCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    padding: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  draftHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  draftCategory: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  draftDate: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
  },
  draftContentRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  draftTextContainer: {
    flex: 1,
  },
  draftSnippet: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textLightPrimary,
  },
  draftThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundLight,
  },
  draftsListContainer: {
    gap: SPACING.md,
  },
  draftActionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
  },
  draftActionBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  draftLoadBtn: {
    backgroundColor: COLORS.backgroundLight,
    borderColor: COLORS.borderLight,
  },
  draftLoadBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLightPrimary,
  },
  draftDeleteBtn: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  draftDeleteBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
});

export default WritePostScreen;
