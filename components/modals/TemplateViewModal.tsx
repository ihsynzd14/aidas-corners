import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import { colorScheme } from '@/constants/colorScheme';

interface Template {
  id: string;
  name: string;
  products: string[];
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

interface TemplateViewModalProps {
  visible: boolean;
  templates: Template[];
  isDarkMode: boolean;
  onClose: () => void;
  onEdit: (template: Template) => void;
  onDelete: (templateId: string) => void;
  onRefresh: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PremiumIcon = ({ name, size = 24, color }: { name: string; size?: number; color: string }) => {
  const iconMap: { [key: string]: string } = {
    close: '✕',
    edit: '✏️',
    delete: '🗑️',
    product: '📦',
    status: '🔵',
    calendar: '📅',
    sparkle: '✨',
    crown: '👑',
  };

  return (
    <Text style={{ fontSize: size, color, lineHeight: size * 1.2 }}>
      {iconMap[name] || '?'}
    </Text>
  );
};

const TemplateCard = ({ 
  template, 
  isDarkMode, 
  onEdit, 
  onDelete,
  index,
  totalItems 
}: { 
  template: Template; 
  isDarkMode: boolean; 
  onEdit: (template: Template) => void; 
  onDelete: (templateId: string) => void;
  index: number;
  totalItems: number;
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  React.useEffect(() => {
    const delay = index * 100;
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, index]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(animatedValue, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleDelete = () => {
    Alert.alert(
      'Şablonu Sil',
      `"${template.name}" şablonunu silmək istədiyinizə əminsiniz?`,
      [
        { text: 'İmtina', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => onDelete(template.id)
        },
      ]
    );
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('az-AZ', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <Animated.View
      style={[
        styles.templateCardContainer,
        {
          backgroundColor: isDarkMode ? colorScheme.cardDark : colorScheme.cardLight,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
          opacity: animatedValue,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardTouchable}
      >
        {/* Premium Header with Crown Icon */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[
              styles.crownContainer,
              { backgroundColor: isDarkMode ? colorScheme.accentRed : colorScheme.primary }
            ]}>
              <PremiumIcon name="crown" size={16} color={colorScheme.white} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[
                styles.templateTitle,
                { color: isDarkMode ? colorScheme.textDark : colorScheme.textLight }
              ]}>
                {template.name}
              </Text>
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: template.isActive ? colorScheme.accentGreen : colorScheme.slate400 }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }
                ]}>
                  {template.isActive ? 'Aktiv' : 'Deaktiv'}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isDarkMode ? colorScheme.accentBlue : colorScheme.slate200 }
              ]}
              onPress={() => onEdit(template)}
            >
              <PremiumIcon name="edit" size={16} color={isDarkMode ? colorScheme.white : colorScheme.slate700} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isDarkMode ? colorScheme.accentRed : colorScheme.lightRed }
              ]}
              onPress={handleDelete}
            >
              <PremiumIcon name="delete" size={16} color={colorScheme.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <PremiumIcon name="product" size={16} color={isDarkMode ? colorScheme.accentRed : colorScheme.primary} />
            <Text style={[
              styles.sectionTitle,
              { color: isDarkMode ? colorScheme.textDark : colorScheme.textLight }
            ]}>
              Məhsullar ({template.products.length})
            </Text>
          </View>
          
          <View style={styles.productsContainer}>
            {template.products.slice(0, 3).map((product, index) => (
              <View key={index} style={[
                styles.productChip,
                { 
                  backgroundColor: isDarkMode ? colorScheme.backgroundDark : colorScheme.slate100,
                  borderColor: isDarkMode ? colorScheme.slate700 : colorScheme.slate300
                }
              ]}>
                <Text style={[
                  styles.productText,
                  { color: isDarkMode ? colorScheme.textSubtleDark : colorScheme.slate600 }
                ]}>
                  {product}
                </Text>
              </View>
            ))}
            {template.products.length > 3 && (
              <View style={[
                styles.productChip,
                styles.moreChip,
                { backgroundColor: isDarkMode ? colorScheme.accentRed : colorScheme.primary }
              ]}>
                <Text style={styles.moreText}>
                  +{template.products.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer with Date */}
        <View style={styles.cardFooter}>
          <View style={styles.dateRow}>
            <PremiumIcon name="calendar" size={14} color={isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight} />
            <Text style={[
              styles.dateText,
              { color: isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }
            ]}>
              Yaradılıb: {formatDate(template.createdAt)}
            </Text>
          </View>
          <View style={styles.sparkleContainer}>
            <PremiumIcon name="sparkle" size={12} color={isDarkMode ? colorScheme.accentRed : colorScheme.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const TemplateViewModal: React.FC<TemplateViewModalProps> = ({
  visible,
  templates,
  isDarkMode,
  onClose,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [modalAnimatedValue] = React.useState(new Animated.Value(0));
  const [backdropAnimatedValue] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(modalAnimatedValue, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnimatedValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalAnimatedValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnimatedValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, modalAnimatedValue, backdropAnimatedValue]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(modalAnimatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnimatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const renderTemplate = ({ item, index }: { item: Template; index: number }) => (
    <TemplateCard
      template={item}
      isDarkMode={isDarkMode}
      onEdit={onEdit}
      onDelete={onDelete}
      index={index}
      totalItems={templates.length}
    />
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropAnimatedValue,
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
          },
        ]}
      >
        <TouchableOpacity style={styles.backdropTouchable} onPress={handleClose} />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            backgroundColor: isDarkMode ? colorScheme.backgroundDark : colorScheme.backgroundLight,
            transform: [
              {
                translateY: modalAnimatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [screenHeight, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Premium Header */}
        <View style={styles.modalHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={[
                styles.headerIconContainer,
                { backgroundColor: isDarkMode ? colorScheme.accentRed : colorScheme.primary }
              ]}>
                <PremiumIcon name="sparkle" size={20} color={colorScheme.white} />
              </View>
              <View>
                <Text style={[
                  styles.modalTitle,
                  { color: isDarkMode ? colorScheme.textDark : colorScheme.textLight }
                ]}>
                  Şablonlar
                </Text>
                <Text style={[
                  styles.modalSubtitle,
                  { color: isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }
                ]}>
                  {templates.length} şablon mövcuddur
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: isDarkMode ? colorScheme.cardDark : colorScheme.slate200 }
              ]}
              onPress={handleClose}
            >
              <PremiumIcon name="close" size={18} color={isDarkMode ? colorScheme.textDark : colorScheme.slate600} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.modalContent}>
          {templates.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[
                styles.emptyIconContainer,
                { backgroundColor: isDarkMode ? colorScheme.cardDark : colorScheme.slate100 }
              ]}>
                <PremiumIcon name="template" size={48} color={isDarkMode ? colorScheme.textSubtleDark : colorScheme.slate400} />
              </View>
              <Text style={[
                styles.emptyTitle,
                { color: isDarkMode ? colorScheme.textDark : colorScheme.textLight }
              ]}>
                Şablon yoxdur
              </Text>
              <Text style={[
                styles.emptyDescription,
                { color: isDarkMode ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }
              ]}>
                Hələ heç bir şablon yaratmamısınız
              </Text>
            </View>
          ) : (
            <FlatList
              data={templates}
              renderItem={renderTemplate}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: screenHeight * 0.1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  modalHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.7,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  listContainer: {
    paddingBottom: 20,
  },
  templateCardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  cardTouchable: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  crownContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productsSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  productText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreChip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sparkleContainer: {
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 32,
  },
});