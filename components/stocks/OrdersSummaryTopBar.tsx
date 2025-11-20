import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import {
  formatAzerbaijaniDate,
  formatAzerbaijaniDayOfWeek,
  getAzerbaijaniRelativeDate
} from '@/utils/azerbaijaniDateUtils';
import { colorScheme } from '@/constants/colorScheme';

interface OrdersSummaryTopBarProps {
  style?: any;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export function OrdersSummaryTopBar({ style, selectedDate: propSelectedDate, onDateChange }: OrdersSummaryTopBarProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState(new Date());
  
  // Use prop date if provided, otherwise use internal state
  const selectedDate = propSelectedDate || internalDate;

  const handleDateChange = (newDate: Date) => {
    setInternalDate(newDate);
    onDateChange?.(newDate);
  };

  const handlePrevDay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    handleDateChange(newDate);
  };

  const handleNextDay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    handleDateChange(newDate);
  };

  const handleDateClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDatePicker(true);
  };

  const handleDatePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (event.type === 'set' && selectedDate) {
      handleDateChange(selectedDate);
    }
  };

  const getCardColor = () => {
    return colorScheme === 'dark' ? Colors.dark.card : Colors.light.card;
  };

  const getTextColor = () => {
    return colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  };

  const getSubtleTextColor = () => {
    return colorScheme === 'dark' ? Colors.dark.textSubtle : Colors.light.textSubtle;
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }, style]}>
      <View style={styles.titleSection}>
        <View style={styles.placeholder} />
        <ThemedText type="title" style={styles.title}>
          Sifarişlər Cədvəli
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.dateNavigationSection}>
        <TouchableOpacity 
          onPress={handlePrevDay}
          style={[styles.navButton, { backgroundColor: getCardColor() }]}
          hitSlop={20}
          activeOpacity={0.7}
        >
            <IconSymbol
              name="chevron.left"
              size={24}
              color={getSubtleTextColor()}
            />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDateClick}
          style={({ pressed }) => [
            styles.dateContainer,
            pressed && styles.dateContainerPressed
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.dateContent}>
            <ThemedText style={[styles.dateText, { color: getTextColor() }]}>
              {getAzerbaijaniRelativeDate(selectedDate)}
            </ThemedText>
            <ThemedText style={[styles.subDateText, { color: getSubtleTextColor() }]}>
              {formatAzerbaijaniDayOfWeek(selectedDate)}
            </ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleNextDay}
          style={[styles.navButton, { backgroundColor: getCardColor() }]}
          hitSlop={20}
          activeOpacity={0.7}
        >
            <IconSymbol
              name="chevron.right"
              size={24}
              color={getSubtleTextColor()}
            />
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { 
        backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
      }]} />

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDatePickerChange}
          locale="az-AZ"
          minimumDate={new Date(2020, 0, 1)}
          maximumDate={new Date()}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorScheme.backgroundLight,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: colorScheme.textDark,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  dateNavigationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.8,
    borderColor: colorScheme.textDark,
  },
  dateContainer: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dateContent: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  dateContainerPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
});