import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AnimatedText } from 'react-native-reanimated/lib/typescript/component/Text';

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

export function PastryLoader() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const opacity3 = useSharedValue(0);

  useEffect(() => {
    // Rotating animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1, // Infinite
      false
    );

    // Pulsing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );

    // Staggered fade animations
    opacity1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withDelay(800, withTiming(0, { duration: 400 }))
      ),
      -1,
      true
    );

    opacity2.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withDelay(800, withTiming(0, { duration: 400 }))
        ),
        -1,
        true
      )
    );

    opacity3.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withDelay(800, withTiming(0, { duration: 400 }))
        ),
        -1,
        true
      )
    );
  }, []);

  const mainIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ],
  }));

  const steamStyle1 = useAnimatedStyle(() => ({
    opacity: opacity1.value,
    transform: [
      { translateY: withSpring(-20 * opacity1.value) },
      { scale: withSpring(0.8 + (0.2 * opacity1.value)) }
    ],
  }));

  const steamStyle2 = useAnimatedStyle(() => ({
    opacity: opacity2.value,
    transform: [
      { translateY: withSpring(-20 * opacity2.value) },
      { scale: withSpring(0.8 + (0.2 * opacity2.value)) }
    ],
  }));

  const steamStyle3 = useAnimatedStyle(() => ({
    opacity: opacity3.value,
    transform: [
      { translateY: withSpring(-20 * opacity3.value) },
      { scale: withSpring(0.8 + (0.2 * opacity3.value)) }
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.steamContainer}>
        <Animated.View style={[styles.steam, steamStyle1]}>
          <MaterialCommunityIcons
            name="cloud"
            size={14}
            color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(74,53,49,0.3)'}
          />
        </Animated.View>
        <Animated.View style={[styles.steam, steamStyle2]}>
          <MaterialCommunityIcons
            name="cloud"
            size={14}
            color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(74,53,49,0.3)'}
          />
        </Animated.View>
        <Animated.View style={[styles.steam, steamStyle3]}>
          <MaterialCommunityIcons
            name="cloud"
            size={14}
            color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(74,53,49,0.3)'}
          />
        </Animated.View>
      </View>
      
      <AnimatedIcon
        style={[styles.mainIcon, mainIconStyle]}
        name="cake-variant"
        size={48}
        color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  steamContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: -10,
    height: 30,
  },
  steam: {
    marginHorizontal: 4,
  },
  mainIcon: {
    marginBottom: 20,
  },
});