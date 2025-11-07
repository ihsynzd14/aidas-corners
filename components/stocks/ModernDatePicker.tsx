import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PastryColors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import {
  formatAzerbaijaniDate,
  formatAzerbaijaniDayOfWeek,
  getAzerbaijaniRelativeDate
} from '@/utils/azerbaijaniDateUtils';

interface ModernDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const ModernDatePicker = ({ selectedDate, onDateChange }: ModernDatePickerProps) => {
  const isDark = useColorScheme() === 'dark';
  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  // Now using Azerbaijani utility functions
  const formatDate = (date: Date) => formatAzerbaijaniDate(date);
  const formatDayOfWeek = (date: Date) => formatAzerbaijaniDayOfWeek(date);

  const handlePreviousDay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    leftScale.value = withSequence(
      withSpring(0.85, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rightScale.value = withSequence(
      withSpring(0.85, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleDateClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (event.type === 'set' && selectedDate) {
      onDateChange(selectedDate);
    }
  };

  
  const leftAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftScale.value }],
  }));

  const rightAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
  }));

  
  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? PastryColors.chocolate : PastryColors.vanilla,
        },
      ]}
    >
      <Animated.View style={leftAnimatedStyle}>
        <TouchableOpacity
          onPress={handlePreviousDay}
          style={[
            styles.arrowButton,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(74,53,49,0.05)',
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          />
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        onPress={handleDateClick}
        style={styles.dateContainer}
        activeOpacity={0.7}
      >
        <View style={styles.dateContent}>
          <ThemedText
            style={[
              styles.dateText,
              {
                color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
              },
            ]}
          >
            {getAzerbaijaniRelativeDate(selectedDate)}
          </ThemedText>
          <ThemedText
            style={[
              styles.dayText,
              {
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              },
            ]}
          >
            {formatDayOfWeek(selectedDate)}
          </ThemedText>
        </View>
      </TouchableOpacity>

      <Animated.View style={rightAnimatedStyle}>
        <TouchableOpacity
          onPress={handleNextDay}
          style={[
            styles.arrowButton,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(74,53,49,0.05)',
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          />
        </TouchableOpacity>
      </Animated.View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          locale="az-AZ"
          minimumDate={new Date(2020, 0, 1)}
          maximumDate={new Date()}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  dateContent: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 14,
  },
  });
