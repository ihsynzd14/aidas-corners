import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
  View,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { colorScheme } from '@/constants/colorScheme';
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
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  const overlayOpacity = overlayAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6], // Slightly darker overlay for better focus
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
          { opacity: overlayOpacity }
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
          intensity={isDark ? 40 : 90}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.modalContent,
            isDark ? styles.modalContentDark : styles.modalContentLight,
          ]}
        >
          {/* Header */}
          <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
            <View style={styles.headerIndicator} />
            <View style={styles.headerTitleRow}>
              <ThemedText style={[styles.modalTitle, isDark ? styles.textSlate100 : styles.textSlate900]}>
                Kafeteriya Seçin
              </ThemedText>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={isDark ? colorScheme.slate400 : colorScheme.slate700}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.locationsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.locationsListContent}
          >
            {locations.map((location) => {
              const isSelected = selectedLocation === location.id;
              return (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationItem,
                    isDark ? styles.locationItemDark : styles.locationItemLight,
                    isSelected && (isDark ? styles.selectedItemDark : styles.selectedItemLight),
                  ]}
                  onPress={() => {
                    onSelectLocation(location.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.locationInfo}>
                    <View style={[
                      styles.iconContainer,
                      isSelected ? styles.iconContainerSelected : (isDark ? styles.iconContainerDark : styles.iconContainerLight)
                    ]}>
                      <Ionicons
                        name={location.icon}
                        size={22}
                        color={isSelected ? colorScheme.white : (isDark ? colorScheme.slate400 : colorScheme.accentRed)}
                      />
                    </View>
                    <ThemedText
                      style={[
                        styles.locationItemText,
                        isDark ? styles.textSlate100 : styles.textSlate900,
                        isSelected && styles.selectedLocationItemText
                      ]}
                    >
                      {location.name}
                    </ThemedText>
                  </View>

                  {isSelected && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons name="checkmark" size={20} color={colorScheme.primaryRed} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            {/* Bottom spacer for safe area */}
            <View style={{ height: 34 }} />
          </ScrollView>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  modalBackground: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    minHeight: 300,
  },
  modalContentLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modalContentDark: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLight: {
    borderBottomColor: colorScheme.slate200,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerDark: {
    borderBottomColor: colorScheme.slate800,
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  headerIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colorScheme.slate300,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
    opacity: 0.5,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
  },
  locationsList: {
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  locationsListContent: {
    padding: 16,
    paddingTop: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  locationItemLight: {
    backgroundColor: colorScheme.white,
    borderColor: colorScheme.borderRed,
    shadowColor: colorScheme.borderRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  locationItemDark: {
    backgroundColor: colorScheme.cardDark,
    borderColor: colorScheme.slate800,
  },
  selectedItemLight: {
    borderColor: colorScheme.primaryRed,
    backgroundColor: '#FFF5F6', // Very light red
  },
  selectedItemDark: {
    borderColor: colorScheme.primaryRed,
    backgroundColor: 'rgba(238, 43, 75, 0.15)',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerLight: {
    backgroundColor: colorScheme.lightRed,
  },
  iconContainerDark: {
    backgroundColor: colorScheme.slate800,
  },
  iconContainerSelected: {
    backgroundColor: colorScheme.primaryRed,
  },
  locationItemText: {
    fontSize: 17,
    fontWeight: '500',
    flex: 1,
  },
  selectedLocationItemText: {
    color: colorScheme.primaryRed,
    fontWeight: '700',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  textSlate100: { color: colorScheme.slate100 },
  textSlate300: { color: colorScheme.slate300 },
  textSlate400: { color: colorScheme.slate400 },
  textSlate500: { color: colorScheme.slate500 },
  textSlate900: { color: colorScheme.slate900 },
});