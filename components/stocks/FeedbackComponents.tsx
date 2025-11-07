import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PastryColors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  type?: 'success' | 'info' | 'warning';
}

export const SuccessToast = ({
  message,
  visible,
  onHide,
  duration = 3000,
  type = 'success',
}: SuccessToastProps) => {
  const isDark = useColorScheme() === 'dark';
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withSpring(1);

      translateY.value = withDelay(
        duration,
        withSequence(
          withSpring(-100, { damping: 15, stiffness: 150 }),
          withSpring(-100, {}, () => {
            runOnJS(onHide)();
          })
        )
      );
      opacity.value = withDelay(duration, withSpring(0));
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'checkmark-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      default:
        return '#10B981';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View
        style={[
          styles.toast,
          {
            backgroundColor: isDark
              ? PastryColors.chocolate
              : PastryColors.vanilla,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${getColor()}20` },
          ]}
        >
          <Ionicons name={getIcon()} size={24} color={getColor()} />
        </View>
        <ThemedText style={styles.message}>{message}</ThemedText>
        <TouchableOpacity onPress={onHide} style={styles.closeButton}>
          <Ionicons
            name="close"
            size={20}
            color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay = ({ visible, message }: LoadingOverlayProps) => {
  const isDark = useColorScheme() === 'dark';
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      opacity.value = withSpring(1);
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 100,
      });
    } else {
      opacity.value = withSpring(0);
      scale.value = withSpring(0.8);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlayContainer, animatedStyle]}>
      <Animated.View
        style={[
          styles.overlayContent,
          contentStyle,
          {
            backgroundColor: isDark
              ? PastryColors.chocolate
              : PastryColors.vanilla,
          },
        ]}
      >
        <View style={styles.spinner}>
          <MaterialIcons
            name="donut-large"
            size={40}
            color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          />
        </View>
        {message && (
          <ThemedText style={styles.overlayMessage}>{message}</ThemedText>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayContent: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  spinner: {
    marginBottom: 16,
  },
  overlayMessage: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
