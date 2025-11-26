import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Dimensions, Animated } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useState, useEffect, useRef } from 'react';
import { colorScheme } from '@/constants/colorScheme';
import { addDoc, collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { getProductCorrections, refreshProductCorrections } from '@/utils/orderCorrection';
import CreateRegionModal from '../components/CreateRegionModal';
import { IconSymbol } from '@/components/ui/IconSymbol';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Clean Icons for mature users
const CleanIcon = ({ name, size = 24, color }: { name: string; size?: number; color: string }) => {
  const iconMap: { [key: string]: string } = {
    add: '+',
    back: '←',
    template: '📋',
    check: '✓',
    folder: '📁',
    edit: '✏️',
    delete: '🗑️',
  };

  return (
    <Text style={{ fontSize: size, color, lineHeight: size * 1.2, fontWeight: '500' }}>
      {iconMap[name] || '?'}
    </Text>
  );
};

export default function ManageCustomShareScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [regionName, setRegionName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);



  useEffect(() => {
    loadThemePreference();
    loadProducts();
    loadTemplates();
  }, []);

  const loadThemePreference = async () => {
    setIsDarkMode(systemColorScheme === 'dark');
  };

  const loadProducts = async () => {
    try {
      const corrections = await getProductCorrections();
      const productList = corrections.map(product => product.correct);
      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshProductCorrections();
      await loadProducts();
    } catch (error) {
      console.error('Error refreshing products:', error);
      Alert.alert('Xəta', 'Məhsullar yenilənərkən xəta baş verdi');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.toLowerCase().includes(searchText.toLowerCase())
  );

  const loadTemplates = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'customShareTemplates'));
      const templateList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTemplates(templateList);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const toggleProduct = (product: string) => {
    setSelectedProducts(prev =>
      prev.includes(product)
        ? prev.filter(p => p !== product)
        : [...prev, product]
    );
  };

  const handleSave = async () => {
    if (!regionName.trim()) {
      Alert.alert('Xəta', 'Bölgə adı daxil edin');
      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert('Xəta', 'Ən azı bir məhsul seçin');
      return;
    }

    try {
      if (editingTemplate) {
        // Update existing template
        const templateRef = doc(db, 'customShareTemplates', editingTemplate.id);
        await updateDoc(templateRef, {
          name: regionName.trim(),
          products: selectedProducts,
          template: `${regionName.trim()}:\n$selected_products`,
          updatedAt: new Date()
        });
        Alert.alert('Uğurlu', 'Şablon yeniləndi');
      } else {
        // Create new template
        await addDoc(collection(db, 'customShareTemplates'), {
          name: regionName.trim(),
          products: selectedProducts,
          template: `${regionName.trim()}:\n$selected_products`,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        Alert.alert('Uğurlu', 'Bölgə yaradıldı');
      }

      setShowAddModal(false);
      setRegionName('');
      setSelectedProducts([]);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      Alert.alert('Xəta', 'Əməliyyat zamanı xəta baş verdi');
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setRegionName(template.name);
    setSelectedProducts(template.products);
    setShowAddModal(true);
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    Alert.alert(
      'Şablonu Sil',
      `"${templateName}" şablonunu silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.`,
      [
        { text: 'İmtina', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'customShareTemplates', templateId));
              Alert.alert('Uğurlu', 'Şablon silindi');
              loadTemplates();
            } catch (error) {
              Alert.alert('Xəta', 'Şablon silinərkən xəta baş verdi');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colorScheme.backgroundDark : colorScheme.backgroundLight }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Clean Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? colorScheme.backgroundDark : colorScheme.backgroundLight }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: isDarkMode ? colorScheme.cardDark : colorScheme.cardLight }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={22} color={isDarkMode ? colorScheme.textDark : colorScheme.textLight} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: isDarkMode ? colorScheme.textDark : colorScheme.textLight }]}>
              Özəl Paylaşım
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }]}>
              Şablonların idarə edilməsi
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View style={[styles.templateCount, { backgroundColor: isDarkMode ? colorScheme.cardDark : colorScheme.cardLight }]}>
              <Text style={[styles.countText, { color: isDarkMode ? colorScheme.textDark : colorScheme.textLight }]}>
                {templates.length}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Clean Content Area */}
      <View style={styles.content}>
        {/* Create New Template Section */}
        <TouchableOpacity
          style={[styles.createSection, { backgroundColor: isDarkMode ? colorScheme.cardDark : colorScheme.cardLight }]}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.createContent}>
            <View style={[styles.createIcon, { backgroundColor: isDarkMode ? colorScheme.accentRed : colorScheme.primary }]}>
              <CleanIcon name="add" size={28} color={colorScheme.white} />
            </View>
            <View style={styles.createText}>
              <Text style={[styles.createTitle, { color: isDarkMode ? colorScheme.textDark : colorScheme.textLight }]}>
                Yeni Şablon Yarat
              </Text>
              <Text style={[styles.createDescription, { color: isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }]}>
                Yeni bölgə şablonu əlavə etmək üçün toxunun
              </Text>
            </View>
            <CleanIcon name="back" size={16} color={isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight} />
          </View>
        </TouchableOpacity>

        {/* Templates List Section */}
        <View style={styles.templatesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? colorScheme.textDark : colorScheme.textLight }]}>
              Mövcud Şablonlar
            </Text>
            <Text style={[styles.sectionCount, { color: isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }]}>
              {templates.length} şablon
            </Text>
          </View>

          {templates.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: isDarkMode ? colorScheme.cardDark : colorScheme.cardLight }]}>
              <CleanIcon name="folder" size={48} color={isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight} />
              <Text style={[styles.emptyTitle, { color: isDarkMode ? colorScheme.textDark : colorScheme.textLight }]}>
                Şablon yoxdur
              </Text>
              <Text style={[styles.emptyDescription, { color: isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }]}>
                Hələ heç bir şablon yaratmamısınız
              </Text>
            </View>
          ) : (
            <View style={styles.templatesList}>
              {templates.map((template) => (
                <View key={template.id} style={[styles.templateCard, { backgroundColor: isDarkMode ? colorScheme.cardDark : colorScheme.cardLight }]}>
                  <View style={styles.templateContent}>
                    <View style={styles.templateInfo}>
                      <Text style={[styles.templateName, { color: isDarkMode ? colorScheme.textDark : colorScheme.textLight }]}>
                        {template.name}
                      </Text>
                      <Text style={[styles.templateDetails, { color: isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }]}>
                        {template.products.length} məhsul • {template.isActive ? 'Aktiv' : 'Deaktiv'}
                      </Text>
                    </View>

                    <View style={styles.templateActions}>
                      <TouchableOpacity
                        style={[styles.iconActionButton, { backgroundColor: isDarkMode ? colorScheme.accentBlue : colorScheme.slate200 }]}
                        onPress={() => handleEditTemplate(template)}
                      >
                        <CleanIcon name="edit" size={18} color={isDarkMode ? colorScheme.white : colorScheme.slate700} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.iconActionButton, { backgroundColor: isDarkMode ? colorScheme.accentRed : colorScheme.lightRed }]}
                        onPress={() => handleDeleteTemplate(template.id, template.name)}
                      >
                        <CleanIcon name="delete" size={18} color={colorScheme.white} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Add/Edit Modal */}
      <CreateRegionModal
        visible={showAddModal}
        isDarkMode={isDarkMode}
        regionName={regionName}
        setRegionName={setRegionName}
        searchText={searchText}
        setSearchText={setSearchText}
        selectedProducts={selectedProducts}
        filteredProducts={filteredProducts}
        onToggleProduct={toggleProduct}
        onSave={handleSave}
        onClose={() => {
          setShowAddModal(false);
          setEditingTemplate(null);
          setRegionName('');
          setSelectedProducts([]);
        }}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  templateCount: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  createSection: {
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  createIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    flex: 1,
  },
  createTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  createDescription: {
    fontSize: 14,
    opacity: 0.7,
  },

  templatesSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyState: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  templatesList: {
    gap: 12,
  },
  templateCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#130505ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  templateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconActionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorScheme.cardLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});