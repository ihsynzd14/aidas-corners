import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  withDelay,
  FadeIn,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PastryColors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WaveProps {
    delay: number;
    scale?: number;
  }

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

export default function EmptyOrdersState() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withRepeat(
          withSequence(
            withTiming(-10, { duration: 1000 }),
            withTiming(0, { duration: 1000 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withRepeat(
          withSequence(
            withTiming('10deg', { duration: 1000 }),
            withTiming('-10deg', { duration: 1000 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  return (
    <Animated.View 
      entering={FadeIn.delay(300)}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: insets.bottom - 30,
        gap: 24
      }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
      }}>
        <Animated.View style={bounceStyle}>
          <MaterialCommunityIcons
            name="cookie"
            size={32}
            color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)'}
          />
        </Animated.View>
        <AnimatedIcon
          style={rotateStyle}
          name="cupcake"
          size={32}
          color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)'}
        />
        <Animated.View style={[bounceStyle, { transform: [{ scale: 0.8 }] }]}>
          <MaterialCommunityIcons
            name="cake-variant"
            size={32}
            color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)'}
          />
        </Animated.View>
      </View>

      <View style={{ alignItems: 'center', gap: 8 }}>
        <ThemedText style={{
          fontSize: 18,
          fontWeight: '600',
          textAlign: 'center',
          color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(74,53,49,0.9)'
        }}>
          Hələ Sifariş Yoxdur
        </ThemedText>
        <ThemedText style={{
          fontSize: 14,
          textAlign: 'center',
          color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,53,49,0.5)',
          maxWidth: 240
        }}>
          Bu gün üçün hələ ki, heç bir sifariş qeydə alınmayıb
        </ThemedText>
      </View>
    </Animated.View>
  );
}

function Wave({ delay, scale: initialScale = 1 }: WaveProps) {
    const opacity = useSharedValue(0.8);
    const scale = useSharedValue(initialScale);
  
    useEffect(() => {
      opacity.value = withRepeat(
        withSequence(
          withDelay(
            delay,
            withTiming(0, { duration: 2000 })
          ),
          withTiming(0.8, { duration: 0 })
        ),
        -1
      );
  
      scale.value = withRepeat(
        withSequence(
          withDelay(
            delay,
            withTiming(initialScale + 0.3, { duration: 2000 })
          ),
          withTiming(initialScale, { duration: 0 })
        ),
        -1
      );
    }, [delay, initialScale]);
  
    const waveStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: scale.value }]
    }));
  
    return (
      <Animated.View style={[{
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: PastryColors.vanilla,
      }, waveStyle]} />
    );
  }
  
  export function EmptyOrdersTableState() {
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
  
    useEffect(() => {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.05, { damping: 10 }),
          withDelay(1000, withSpring(1, { damping: 10 }))
        ),
        -1,
        true
      );
  
      rotation.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 2000 }),
          withTiming(5, { duration: 2000 })
        ),
        -1,
        true
      );
    }, []);
  
    const containerStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ]
    }));
  
    // Dimensions for the container and image
    const CONTAINER_SIZE = 120;
    const IMAGE_SIZE = CONTAINER_SIZE * 0.8; // 80% of container size
  
    return (
      <ThemedView style={{
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24
      }}>
        <Animated.View style={[{
          alignItems: 'center',
          justifyContent: 'center'
        }, containerStyle]}>
          <View style={{
            width: 140,
            height: 140,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Waves */}
            <Wave delay={0} scale={1} />
            <Wave delay={666} scale={1.1} />
            <Wave delay={1333} scale={1.2} />
            
            {/* Circle background and image container */}
            <View style={{
              position: 'absolute',
              width: CONTAINER_SIZE,
              height: CONTAINER_SIZE,
              borderRadius: CONTAINER_SIZE / 2,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.05)',
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: IMAGE_SIZE / 2,
                  resizeMode: 'cover' // Changed from 'contain' to 'cover'
                }}
              />
            </View>
          </View>
        </Animated.View>
  
        <ThemedView style={{
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'transparent'
        }}>
          <ThemedText style={{
            fontSize: 20,
            fontWeight: '600',
            textAlign: 'center',
            color: isDark ? PastryColors.vanilla : PastryColors.chocolate
          }}>
            Hələ sifariş yoxdur
          </ThemedText>
          <ThemedText style={{
            fontSize: 16,
            textAlign: 'center',
            opacity: 0.7,
            lineHeight: 22
          }}>
            Bu tarixdə heç bir sifariş qeydə alınmayıb.{'\n'}
            Başqa bir tarix seçin və ya daha sonra yoxlayın 🍪
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

