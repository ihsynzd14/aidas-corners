import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Platform,
  View,
  TextInput,
  Alert,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { colorScheme } from '@/constants/colorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { LocationSelectionModal } from '@/components/orders/LocationSelectionModal';
import { CorrectionModal } from '@/components/orders/CorrectionModal';
import { correctOrderText } from '@/utils/orderCorrection';
import { getBranches, addOrder, formatDate } from '@/utils/firebase';
import { Branch } from '@/types/branch';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { styles } from './new_orders.styles';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function NewOrdersScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const router = useRouter();

  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [orderText, setOrderText] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [previewProducts, setPreviewProducts] = useState<string[]>([]);

  // Animation values
  const animation = useRef(new Animated.Value(0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  // Correction modal state (kept from original logic)
  const [correctionModalVisible, setCorrectionModalVisible] = useState(false);
  const [correctedText, setCorrectedText] = useState('');

  // Update preview products when order text changes
  useEffect(() => {
    const updatePreview = async () => {
      if (orderText.trim()) {
        try {
          const corrected = await correctOrderText(orderText);
          const products = corrected.split('\n').filter(l => l.trim());
          setPreviewProducts(products);
        } catch (error) {
          console.error('Error updating preview:', error);
          setPreviewProducts([]);
        }
      } else {
        setPreviewProducts([]);
      }
    };

    const timeoutId = setTimeout(updatePreview, 500);
    return () => clearTimeout(timeoutId);
  }, [orderText]);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchesData = await getBranches();
        setBranches(branchesData);
      } catch (error) {
        console.error('Error loading branches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, []);

  const selectedBranch = branches.find(branch => branch.id === selectedLocation);

  const animateModal = (show: boolean) => {
    if (show) setModalVisible(true);

    Animated.parallel([
      Animated.spring(animation, {
        toValue: show ? 1 : 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
        velocity: 0.1,
      }),
      Animated.timing(overlayAnimation, {
        toValue: show ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!show) setModalVisible(false);
    });
  };

  const toggleModal = () => {
    if (!modalVisible) {
      animateModal(true);
    } else {
      animateModal(false);
    }
  };

  const handleSave = async () => {
    if (!orderText.trim() || !selectedBranch) return;

    try {
      setIsSaving(true);
      const corrected = await correctOrderText(orderText);

      const formattedDate = formatDate(selectedDate);

      const orders = corrected.split('\n').filter(line => line.trim());

      for (const orderLine of orders) {
        const [product, quantity] = orderLine.split(' - ');
        const branchFullName = `${selectedBranch.type} ${selectedBranch.name}`;

        await addOrder(formattedDate, {
          branch: branchFullName,
          product: product.trim(),
          quantity: quantity.trim()
        });
      }

      setOrderText('');
      setSelectedLocation('');

      Alert.alert(
        'Uğurlu!',
        'Sifariş uğurla əlavə edildi',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error saving order:', error);
      Alert.alert(
        'Xəta!',
        'Sifarişi saxlayarkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
      Keyboard.dismiss();
    }
  };

  const onChangeDate = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.safeAreaDark : styles.safeAreaLight]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={isDark ? colorScheme.accentRed : colorScheme.slate700} />
          </TouchableOpacity>
          <ThemedText style={[styles.headerTitle, isDark ? styles.textSlate100 : styles.textSlate900]}>
            Yeni Sifariş
          </ThemedText>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              {/* Date Input */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, isDark ? styles.textSlate300 : styles.textSlate700]}>
                  Sifariş Tarixi
                </ThemedText>
                <View style={styles.dateInputContainer}>
                  <MaterialIcons
                    name="calendar-today"
                    size={20}
                    color={colorScheme.accentRed}
                    style={styles.inputIcon}
                  />
                  <TouchableOpacity
                    style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <ThemedText style={[styles.inputText, isDark ? styles.textSlate100 : styles.textSlate900]}>
                      {formatDate(selectedDate)}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                  />
                )}
              </View>

              {/* Cafeteria Select */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, isDark ? styles.textSlate300 : styles.textSlate700]}>
                  Kafeteriya
                </ThemedText>
                <TouchableOpacity
                  style={[styles.selectInput, isDark ? styles.inputDark : styles.inputLight]}
                  onPress={toggleModal}
                >
                  <MaterialIcons
                    name="storefront"
                    size={20}
                    color={colorScheme.accentRed}
                    style={styles.inputIconLeft}
                  />
                  <ThemedText style={[styles.selectText, !selectedBranch && styles.placeholderText, isDark ? styles.textSlate100 : styles.textSlate900]}>
                    {selectedBranch ? `${selectedBranch.type} ${selectedBranch.name}` : 'Seçim edin'}
                  </ThemedText>
                  <MaterialIcons
                    name="expand-more"
                    size={20}
                    color={colorScheme.accentRed}
                  />
                </TouchableOpacity>
              </View>

              {/* Order Notes */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, isDark ? styles.textSlate300 : styles.textSlate700]}>
                  Sifariş Məlumatları
                </ThemedText>
                <TextInput
                  style={[
                    styles.textArea,
                    isDark ? styles.textAreaDark : styles.textAreaLight,
                    isDark ? styles.textSlate100 : styles.textSlate900
                  ]}
                  multiline
                  numberOfLines={5}
                  placeholder="Xüsusi qeydlərinizi əlavə edin..."
                  placeholderTextColor={isDark ? colorScheme.slate500 : colorScheme.slate400}
                  value={orderText}
                  onChangeText={setOrderText}
                  textAlignVertical="top"
                />

                {/* Order Preview Section */}
                {orderText.trim().length > 0 && (
                  <View style={[
                    styles.previewContainer,
                    isDark ? styles.previewContainerDark : styles.previewContainerLight
                  ]}>
                    <TouchableOpacity
                      style={styles.previewHeader}
                      onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setIsPreviewExpanded(!isPreviewExpanded);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MaterialIcons
                          name="receipt-long"
                          size={20}
                          color={isDark ? colorScheme.primary : colorScheme.accentRed}
                        />
                        <ThemedText>
                          Sifariş Baxışı
                        </ThemedText>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {!isPreviewExpanded && (
                          <View style={styles.previewBadge}>
                            <ThemedText style={styles.previewBadgeText}>
                              {previewProducts.length} məhsul
                            </ThemedText>
                          </View>
                        )}
                        <MaterialIcons
                          name={isPreviewExpanded ? "expand-less" : "expand-more"}
                          size={24}
                          color={colorScheme.accentRed}
                        />
                      </View>
                    </TouchableOpacity>

                    {isPreviewExpanded && (
                      <View style={styles.previewContent}>
                        {previewProducts.map((line, index, array) => {
                          const parts = line.split(' - ');
                          const name = parts[0] || line;
                          const quantity = parts[1] || '';

                          return (
                            <View
                              key={index}
                              style={[
                                styles.previewItem,
                                index === array.length - 1 && styles.previewItemLast
                              ]}
                            >
                              <ThemedText style={[styles.previewItemName, isDark ? styles.textSlate300 : styles.textSlate700]}>
                                {index + 1}. {name}
                              </ThemedText>
                              {quantity ? (
                                <ThemedText style={styles.previewItemQuantity}>
                                  {quantity}
                                </ThemedText>
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer */}
        <View style={[styles.footer, isDark ? styles.footerDark : styles.footerLight]}>
          <TouchableOpacity
            style={[styles.saveButton, (!selectedLocation || !orderText || isSaving) && styles.disabledButton]}
            onPress={handleSave}
            disabled={!selectedLocation || !orderText || isSaving}
          >
            <ThemedText style={styles.saveButtonText}>
              {isSaving ? 'Saxlanılır...' : 'Sifarişi Yadda Saxla'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Modals */}
        <LocationSelectionModal
          visible={modalVisible}
          onClose={() => animateModal(false)}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          locations={branches.map(branch => ({
            id: branch.id,
            name: branch.type + ' ' + branch.name,
            icon: 'business'
          }))}
          modalAnimation={animation}
          overlayAnimation={overlayAnimation}
        />

        <CorrectionModal
          visible={correctionModalVisible}
          onClose={() => setCorrectionModalVisible(false)}
          originalText={orderText}
          correctedText={correctedText}
        />
      </View>
    </SafeAreaView>
  );
}