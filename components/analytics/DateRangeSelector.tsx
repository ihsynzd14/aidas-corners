import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors, PastryColors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width: screenWidth } = Dimensions.get('window');

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

interface PresetOption {
  label: string;
  days: number;
}

const PRESET_OPTIONS: PresetOption[] = [
  { label: 'Son 7 gün', days: 7 },
  { label: 'Son 30 gün', days: 30 },
  { label: 'Son 90 gün', days: 90 },
];

export function DateRangeSelector({ startDate, endDate, onDateRangeChange }: DateRangeSelectorProps) {
  const isDark = useColorScheme() === 'dark';
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handlePresetSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onDateRangeChange(start, end);
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      onDateRangeChange(selectedDate, endDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      onDateRangeChange(startDate, selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <ThemedView style={[
      styles.container,
      {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      }
    ]}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="calendar-range"
          size={20}
          color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
        />
        <ThemedText style={[
          styles.title,
          { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
        ]}>
          Tarix Aralığı
        </ThemedText>
      </View>

      {/* Preset Options */}
      <View style={styles.presetContainer}>
        {PRESET_OPTIONS.map((preset) => (
          <TouchableOpacity
            key={preset.days}
            style={[
              styles.presetButton,
              {
                backgroundColor: isDark ? 'rgba(255,148,148,0.1)' : 'rgba(255,148,148,0.1)',
                borderColor: isDark ? 'rgba(255,148,148,0.3)' : 'rgba(255,148,148,0.3)',
              }
            ]}
            onPress={() => handlePresetSelect(preset.days)}
          >
            <ThemedText style={[
              styles.presetText,
              { color: isDark ? PastryColors.primary : PastryColors.chocolate }
            ]}>
              {preset.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Date Selection */}
      <View style={styles.dateContainer}>
        <TouchableOpacity
          style={[
            styles.dateButton,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            }
          ]}
          onPress={() => setShowStartPicker(true)}
        >
          <MaterialCommunityIcons
            name="calendar-start"
            size={16}
            color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          />
          <View style={styles.dateTextContainer}>
            <ThemedText style={[
              styles.dateLabel,
              { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)' }
            ]}>
              Başlanğıc
            </ThemedText>
            <ThemedText style={[
              styles.dateValue,
              { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
            ]}>
              {formatDate(startDate)}
            </ThemedText>
          </View>
        </TouchableOpacity>

        <View style={[
          styles.dateSeparator,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }
        ]} />

        <TouchableOpacity
          style={[
            styles.dateButton,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            }
          ]}
          onPress={() => setShowEndPicker(true)}
        >
          <MaterialCommunityIcons
            name="calendar-end"
            size={16}
            color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          />
          <View style={styles.dateTextContainer}>
            <ThemedText style={[
              styles.dateLabel,
              { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)' }
            ]}>
              Son
            </ThemedText>
            <ThemedText style={[
              styles.dateValue,
              { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
            ]}>
              {formatDate(endDate)}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
          maximumDate={endDate}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDateChange}
          minimumDate={startDate}
          maximumDate={new Date()}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  presetContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateSeparator: {
    width: 2,
    height: 20,
    borderRadius: 1,
  },
}); 