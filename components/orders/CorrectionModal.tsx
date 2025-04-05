// src/components/CorrectionModal.tsx
import React, { useEffect } from 'react';
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

interface CorrectionModalProps {
  visible: boolean;
  onClose: () => void;
  originalText: string;
  correctedText: string;
}

export function CorrectionModal({
  visible,
  onClose,
  originalText,
  correctedText
}: CorrectionModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [animation] = React.useState(new Animated.Value(0));
  const [overlayAnimation] = React.useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(animation, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(animation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const modalTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayAnimation,
              backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
            },
          ]}
        >
          <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContent,
            isDark ? styles.modalContentDark : styles.modalContentLight,
            { transform: [{ translateY: modalTranslateY }] },
          ]}
        >
          {/* Header */}
          <ThemedView style={styles.modalHeader}>
            <ThemedView style={styles.titleContainer}>
              <Ionicons
                name="repeat"
                size={24}
                color={isDark ? PastryColors.vanilla : Colors.dark.text}
              />
              <ThemedText style={styles.titleText}>
                Sifarişin Düzəlişləri
              </ThemedText>
            </ThemedView>
            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? PastryColors.vanilla : Colors.dark.text}
              />
            </TouchableOpacity>
          </ThemedView>

          {/* Content */}
          <ScrollView style={styles.scrollContent}>
            <ThemedView style={styles.comparisonContainer}>
              {/* Original Text */}
              <ThemedView style={styles.textSection}>
                <ThemedView style={styles.sectionHeader}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color={Colors.danger}
                  />
                  <ThemedText style={[styles.sectionTitle, { color: Colors.danger }]}>
                    Orijinal Mətn
                  </ThemedText>
                </ThemedView>
                <ThemedView 
                  style={[
                    styles.textContainer,
                    isDark ? styles.textContainerDark : styles.textContainerLight,
                    { borderColor: Colors.danger }
                  ]}
                >
                  <ThemedText style={styles.orderText}>{originalText}</ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Arrow Icon */}
              <ThemedView style={styles.arrowContainer}>
                <Ionicons
                  name="arrow-down"
                  size={24}
                  color={isDark ? PastryColors.vanilla : Colors.dark.text}
                />
              </ThemedView>

              {/* Corrected Text */}
              <ThemedView style={styles.textSection}>
                <ThemedView style={styles.sectionHeader}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.success}
                  />
                  <ThemedText style={[styles.sectionTitle, { color: Colors.success }]}>
                    Düzəldilmiş Mətn
                  </ThemedText>
                </ThemedView>
                <ThemedView 
                  style={[
                    styles.textContainer,
                    isDark ? styles.textContainerDark : styles.textContainerLight,
                    { borderColor: Colors.success }
                  ]}
                >
                  <ThemedText style={styles.orderText}>{correctedText}</ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ScrollView>

          {/* Footer */}
          <ThemedView style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: PastryColors.chocolate }]}
              onPress={onClose}
            >
              <ThemedText style={styles.confirmButtonText}>Təsdiq Et</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Animated.View>
      </ThemedView>
    </Modal>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTouch: {
    flex: 1,
  },
  modalContent: {
    height: SCREEN_HEIGHT * 0.8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  modalContentLight: {
    backgroundColor: Colors.light.background,
  },
  modalContentDark: {
    backgroundColor: Colors.dark.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  comparisonContainer: {
    padding: 16,
    gap: 16,
  },
  textSection: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  textContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  textContainerLight: {
    backgroundColor: '#fff',
  },
  textContainerDark: {
    backgroundColor: '#2A2A2A',
  },
  orderText: {
    fontSize: 16,
    lineHeight: 24,
  },
  arrowContainer: {
    alignItems: 'center',
    padding: 8,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
   
  },
  confirmButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: Colors.light.background,
    fontSize: 18,
    fontWeight: '600',
  },
});