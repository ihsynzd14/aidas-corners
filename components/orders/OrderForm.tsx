import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Animated,
  Keyboard,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LocationSelectionModal } from './LocationSelectionModal';

interface Location {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const LOCATIONS: Location[] = [
  { id: 'nerimanov', name: 'Nərimanov', icon: 'location' },
  { id: 'deniz_mall', name: 'Dəniz Mall', icon: 'business' },
  { id: 'city_mall', name: 'City Mall', icon: 'storefront' },
];

export function OrderForm() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [orderText, setOrderText] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [animation] = useState(new Animated.Value(0));
  const [overlayAnimation] = useState(new Animated.Value(0));
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const selectedLocationData = LOCATIONS.find(loc => loc.id === selectedLocation);

  const handleSave = () => {
    console.log({ selectedLocation, orderText });
    // Add haptic feedback here if needed
    Keyboard.dismiss();
  };

  const animateModal = (show: boolean) => {
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
      setModalVisible(true);
      animateModal(true);
    } else {
      animateModal(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingBottom: keyboardHeight }]}>
      <ThemedView style={styles.locationContainer}>
        <ThemedView style={styles.sectionTitleContainer}>
          <Ionicons
            name="restaurant"
            size={24}
            color={isDark ? PastryColors.cream : Colors.dark.tabIconDefault}
          />
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Kafeteriya
          </ThemedText>
        </ThemedView>
        
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            isDark ? styles.dropdownButtonDark : styles.dropdownButtonLight,
            styles.elevation
          ]}
          onPress={toggleModal}
          activeOpacity={0.7}
        >
          {selectedLocationData ? (
            <ThemedView style={styles.selectedLocationContent}>
              <Ionicons
                name={selectedLocationData.icon}
                size={24}
                color={isDark ? PastryColors.vanilla : Colors.dark.tabIconDefault}
              />
              <ThemedText style={styles.selectedLocationText}>
                {selectedLocationData.name}
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.placeholderContent}>
              <Ionicons
                name="location-outline"
                size={24}
                color={isDark ? '#666' : '#999'}
              />
              <ThemedText style={styles.placeholderText}>
                Zəhmət olmasa lokasiya seçin
              </ThemedText>
            </ThemedView>
          )}
          <Ionicons
            name="chevron-down"
            size={24}
            color={isDark ? PastryColors.vanilla : Colors.dark.tabIconDefault}
          />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.orderContainer}>
        <ThemedView style={styles.sectionTitleContainer}>
          <Ionicons
            name="logo-whatsapp"
            size={24}
            color={isDark ? PastryColors.vanilla : Colors.dark.tabIconDefault}
          />
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Sifariş Məlumatları
          </ThemedText>
        </ThemedView>
        
        <ThemedView 
          style={[
            styles.textAreaContainer,
            isDark ? styles.textAreaContainerDark : styles.textAreaContainerLight,
            styles.elevation,
            isFocused && styles.textAreaContainerFocused
          ]}
        >
          <TextInput
            style={[
              styles.textArea,
              { color: isDark ? Colors.dark.text : Colors.light.text }
            ]}
            multiline
            numberOfLines={10}
            placeholder="WhatsApp sifarişini buraya yapışdırın..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            value={orderText}
            onChangeText={setOrderText}
            textAlignVertical="top"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </ThemedView>
      </ThemedView>

      <TouchableOpacity
        style={[
          styles.saveButton,
          (!selectedLocation || !orderText) && styles.disabledButton,
          isDark ? styles.saveButtonDark : styles.saveButtonLight,
          styles.elevation
        ]}
        onPress={handleSave}
        disabled={!selectedLocation || !orderText}
        activeOpacity={0.7}
      >
        <ThemedView style={styles.saveButtonContent}>
          <Ionicons
            name="cart"
            size={24}
            color={PastryColors.vanilla}
          />
          <ThemedText style={styles.saveButtonText}>
            Sifarişi Yadda Saxla
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>

      <LocationSelectionModal
        visible={modalVisible}
        onClose={toggleModal}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        locations={LOCATIONS}
        modalAnimation={animation}
        overlayAnimation={overlayAnimation}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    padding: 16,
  },
  elevation: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 1,
    },
  }) as ViewStyle,
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  locationContainer: {
    gap: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  dropdownButtonLight: {
    backgroundColor: '#fff',
  },
  dropdownButtonDark: {
    backgroundColor: '#2A2A2A',
  },
  selectedLocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  placeholderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,      
    backgroundColor: 'transparent',
  },
  selectedLocationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  orderContainer: {
    gap: 8,
  },
  textAreaContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textAreaContainerLight: {
    backgroundColor: '#fff',
    borderColor: PastryColors.chocolate,
  },
  textAreaContainerDark: {
    backgroundColor: '#2A2A2A',
    borderColor: PastryColors.chocolate,
  },
  textAreaContainerFocused: {
    borderColor: PastryColors.chocolate,
  },
  textArea: {
    padding: 16,
    minHeight: 200,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,
  saveButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveButtonLight: {
    backgroundColor: PastryColors.chocolate,
  },
  saveButtonDark: {
    backgroundColor: PastryColors.chocolate,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: '100%',
    backgroundColor: Colors.light.text
  },
  saveButtonText: {
    color: Colors.light.background,
    fontSize: 18,
    fontWeight: '600',
  }
});