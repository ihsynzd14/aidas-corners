import React, { useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PastryColors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MIN_SHEET_HEIGHT = 250;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.8;
const DRAG_THRESHOLD = 50;

interface ModernBottomSheetProps {
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ModernBottomSheet = ({
  children,
  isExpanded,
  onToggle,
}: ModernBottomSheetProps) => {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const animation = useSharedValue(0);
  const dragY = useSharedValue(0);

  useEffect(() => {
    animation.value = withSpring(isExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 150,
      mass: 1,
    });
  }, [isExpanded]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  let startY = 0;

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY = dragY.value;
    })
    .onUpdate((event) => {
      const newY = startY + event.translationY;
      
      if (isExpanded) {
        if (newY > 0) {
          dragY.value = newY;
        }
      } else {
        if (newY < 0) {
          dragY.value = newY;
        }
      }
    })
    .onEnd(() => {
      const shouldToggle = Math.abs(dragY.value) > DRAG_THRESHOLD;
      
      if (shouldToggle) {
        runOnJS(handleToggle)();
      }
      
      dragY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
    });

  const animatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animation.value,
      [0, 1],
      [MIN_SHEET_HEIGHT, EXPANDED_HEIGHT],
      Extrapolate.CLAMP
    );

    return {
      height: height + dragY.value,
    };
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animation.value,
      [0, 1],
      [0, 0.5],
      Extrapolate.CLAMP
    ),
    pointerEvents: isExpanded ? 'auto' : 'none',
  }));

  const handleBackdropPress = () => {
    if (isExpanded) {
      handleToggle();
    }
  };

  return (
    <>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? PastryColors.chocolate : PastryColors.vanilla,
              paddingBottom: insets.bottom,
            },
            animatedStyle,
          ]}
        >
          <TouchableOpacity
            onPress={handleToggle}
            style={styles.handle}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.handleBar,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(0,0,0,0.2)',
                },
              ]}
            />
            <Ionicons
              name={isExpanded ? 'chevron-down' : 'chevron-up'}
              size={20}
              color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
            />
          </TouchableOpacity>

          <ThemedView style={styles.content}>{children}</ThemedView>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 998,
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  handle: {
    width: '100%',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
