import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PastryColors } from '@/constants/Colors';
import { 
  formatAzerbaijaniDate, 
  getAzerbaijaniRelativeDate 
} from '@/utils/azerbaijaniDateUtils';

interface OrdersSummaryHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  style?: ViewStyle;
}

export const OrdersSummaryHeader: React.FC<OrdersSummaryHeaderProps> = ({
  selectedDate,
  onDateChange,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  
  // Theme colors
  const cardBackground = isDark ? '#1A1A1A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#2C1810';
  const textSecondaryColor = isDark ? '#CCCCCC' : '#666666';
  const borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePreviousDay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const previousDate = new Date(selectedDate);
    previousDate.setDate(previousDate.getDate() - 1);
    onDateChange(previousDate);
  };

  const handleNextDay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    onDateChange(nextDate);
  };

  const animateButton = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]}>
      <BlurView
        intensity={80}
        tint="default"
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        {/* First row - Title */}
        <View style={styles.titleRow}>
          <View style={styles.spacer} />
          <ThemedText style={styles.title}>
            Sifarişlər Cədvəli
          </ThemedText>
          <View style={styles.spacer} />
        </View>

        {/* Second row - Date navigation */}
        <View style={styles.dateRow}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: cardBackground }]}
              onPress={() => animateButton(handlePreviousDay)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={20}
                color={textSecondaryColor}
              />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.dateContainer}>
            <ThemedText style={styles.dateText}>
              {formatAzerbaijaniDate(selectedDate)}
            </ThemedText>
            <ThemedText style={styles.relativeDateText} lightColor="#666666" darkColor="#CCCCCC">
              {getAzerbaijaniRelativeDate(selectedDate)}
            </ThemedText>
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: cardBackground }]}
              onPress={() => animateButton(handleNextDay)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={textSecondaryColor}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom divider */}
        <View style={[styles.divider, { backgroundColor: borderColor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  spacer: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  relativeDateText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
  },
});