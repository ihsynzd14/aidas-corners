import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

interface Location {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface LocationSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLocation: string;
  onSelectLocation: (locationId: string) => void;
  locations: Location[];
  modalAnimation: Animated.Value;
  overlayAnimation: Animated.Value;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function LocationSelectionModal({
  visible,
  onClose,
  selectedLocation,
  onSelectLocation,
  locations,
  modalAnimation,
  overlayAnimation,
}: LocationSelectionModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  const overlayOpacity = overlayAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    modalHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#333' : '#e5e5e5',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          { opacity: overlayOpacity, backgroundColor: '#000' }
        ]}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: modalTranslateY }],
          },
        ]}
      >
        <BlurView
          intensity={isDark ? 25 : 80}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.modalContent,
            isDark ? styles.modalContentDark : styles.modalContentLight,
          ]}
        >
          <ThemedView style={dynamicStyles.modalHeader}>
            <ThemedText style={styles.modalTitle}>
              Lokasiya Seçin
            </ThemedText>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={24}
                color={isDark ? PastryColors.vanilla : Colors.dark.tabIconDefault}
              />
            </TouchableOpacity>
          </ThemedView>
          
          <ScrollView 
            style={styles.locationsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.locationsListContent}
          >
            {locations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.locationItem,
                  selectedLocation === location.id && styles.selectedItem,
                  selectedLocation === location.id && 
                    (isDark ? styles.selectedItemDark : styles.selectedItemLight),
                ]}
                onPress={() => {
                  onSelectLocation(location.id);
                  onClose();
                }}
              >
                <Ionicons
                  name={location.icon}
                  size={24}
                  color={
                    selectedLocation === location.id
                      ? PastryColors.vanilla
                      : (isDark ? PastryColors.vanilla : Colors.dark.tabIconDefault)
                  }
                />
                <ThemedText
                  style={[
                    styles.locationItemText,
                    selectedLocation === location.id && styles.selectedLocationItemText
                  ]}
                >
                  {location.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
  } as ViewStyle,
  modalBackground: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.7,
  } as ViewStyle,
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: 300,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 24,
      },
    }),
  } as ViewStyle,
  modalContentLight: {
    backgroundColor: '#F9FAFB',
  },
  modalContentDark: {
    backgroundColor: 'rgba(30, 30, 30, 0.98)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  locationsList: {
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  locationsListContent: {
    padding: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  selectedItem: {
    transform: [{ scale: 1 }],
  },
  selectedItemLight: {
    backgroundColor: Colors.light.text,
    borderColor: Colors.light.text,
  },
  selectedItemDark: {
    backgroundColor: PastryColors.chocolate,
    borderColor: Colors.dark.background,
  },
  locationItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedLocationItemText: {
    color: PastryColors.vanilla,
    fontWeight: '600',
  },
});