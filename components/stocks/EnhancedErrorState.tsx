import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, PastryColors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

interface EnhancedErrorStateProps {
  error: string;
  onRetry?: () => void;
  type?: 'network' | 'server' | 'unknown';
}

export const EnhancedErrorState = ({ 
  error, 
  onRetry,
  type = 'unknown' 
}: EnhancedErrorStateProps) => {
  const isDark = useColorScheme() === 'dark';
  const scale = useSharedValue(1);

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    onRetry?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return 'cloud-offline-outline';
      case 'server':
        return 'server-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getErrorTitle = () => {
    switch (type) {
      case 'network':
        return 'İnternet Bağlantısı Yoxdur';
      case 'server':
        return 'Server Xətası';
      default:
        return 'Xəta Baş Verdi';
    }
  };

  const getErrorDescription = () => {
    switch (type) {
      case 'network':
        return 'İnternet bağlantınızı yoxlayın və yenidən cəhd edin.';
      case 'server':
        return 'Server ilə əlaqə qurula bilmədi. Bir az sonra yenidən cəhd edin.';
      default:
        return error || 'Gözlənilməz xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(239, 68, 68, 0.08)',
          },
        ]}
      >
        <Ionicons
          name={getErrorIcon()}
          size={64}
          color={Colors.danger}
        />
      </View>

      <ThemedText style={styles.title}>
        {getErrorTitle()}
      </ThemedText>

      <ThemedText
        style={[
          styles.description,
          { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' },
        ]}
      >
        {getErrorDescription()}
      </ThemedText>

      {onRetry && (
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            onPress={handleRetry}
            style={[
              styles.retryButton,
              {
                backgroundColor: isDark
                  ? PastryColors.rosePink
                  : PastryColors.chocolate,
              },
            ]}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="refresh"
              size={20}
              color="#FFFFFF"
              style={styles.retryIcon}
            />
            <ThemedText style={styles.retryText}>
              Yenidən Cəhd Et
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.tipsContainer}>
        <ThemedText
          style={[
            styles.tipsTitle,
            { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' },
          ]}
        >
          Təkliflər:
        </ThemedText>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <View
              style={[
                styles.tipBullet,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(0,0,0,0.3)',
                },
              ]}
            />
            <ThemedText
              style={[
                styles.tipText,
                { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' },
              ]}
            >
              İnternet bağlantınızı yoxlayın
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <View
              style={[
                styles.tipBullet,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(0,0,0,0.3)',
                },
              ]}
            />
            <ThemedText
              style={[
                styles.tipText,
                { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' },
              ]}
            >
              Tətbiqi yenidən başladın
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <View
              style={[
                styles.tipBullet,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(0,0,0,0.3)',
                },
              ]}
            />
            <ThemedText
              style={[
                styles.tipText,
                { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' },
              ]}
            >
              Problem davam edərsə, dəstəklə əlaqə saxlayın
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: 40,
    width: '100%',
    maxWidth: 400,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
