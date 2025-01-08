import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '@/utils/firebase';

interface DatePickerProps {
  startDate: Date;
  endDate: Date;
  showStartPicker: boolean;
  showEndPicker: boolean;
  onStartDateChange: (event: any, date?: Date) => void;
  onEndDateChange: (event: any, date?: Date) => void;
  setShowStartPicker: (show: boolean) => void;
  setShowEndPicker: (show: boolean) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  startDate,
  endDate,
  showStartPicker,
  showEndPicker,
  onStartDateChange,
  onEndDateChange,
  setShowStartPicker,
  setShowEndPicker,
}) => {
  return (
    <ThemedView style={styles.datePickerContainer}>
      <TouchableOpacity 
        style={styles.dateButton} 
        onPress={() => setShowStartPicker(true)}
      >
        <ThemedText style={styles.dateButtonText}>
          Başlanğıc: {formatDate(startDate)}
        </ThemedText>
        <AntDesign name="calendar" size={20} color="#4A3531" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.dateButton} 
        onPress={() => setShowEndPicker(true)}
      >
        <ThemedText style={styles.dateButtonText}>
          Son: {formatDate(endDate)}
        </ThemedText>
        <AntDesign name="calendar" size={20} color="#4A3531" />
      </TouchableOpacity>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={onStartDateChange}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          onChange={onEndDateChange}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 53, 49, 0.1)',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 53, 49, 0.05)',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#4A3531',
    marginRight: 8,
    flex: 1,
  },
}); 