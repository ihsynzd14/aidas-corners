import React from 'react';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDate } from '@/utils/firebase';
import { colorScheme } from '@/constants/colorScheme';

interface DatePickerProps {
  startDate: Date;
  endDate: Date;
  onPress: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  startDate,
  endDate,
  onPress,
}) => {
  const nativeColorScheme = useColorScheme();
  const isDark = nativeColorScheme === 'dark';

  return (
    <View style={styles.datePickerContainer}>
      <TouchableOpacity
        style={[
          styles.dateButton,
          { backgroundColor: isDark ? colorScheme.cardDark : colorScheme.cardLight }
        ]}
        onPress={onPress}
      >
        <View style={styles.calendarIcon}>
          <MaterialIcons name="date-range" size={24} color={colorScheme.accentRed} />
        </View>
        <ThemedText style={styles.dateButtonText}>
          {formatDate(startDate)} - {formatDate(endDate)}
        </ThemedText>
        <View style={styles.expandIcon}>
          <MaterialIcons 
            name="expand-more" 
            size={24} 
            color={isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight} 
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  datePickerContainer: {
    marginBottom: 16, // mb-4
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // gap-4
    backgroundColor: colorScheme.cardLight,
    borderRadius: 8, // rounded-lg
    padding: 16, // p-4
    shadowColor: colorScheme.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05, // shadow-sm shadow-primary/5
    shadowRadius: 2,
    elevation: 2,
  },
  calendarIcon: {
    width: 40, // size-10
    height: 40, // size-10
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20, // rounded-full
    backgroundColor: `${colorScheme.primary}10`, // bg-primary/10
  },
  expandIcon: {
    flexShrink: 0,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16, // text-base
    fontWeight: '500', // font-medium
    textAlign: 'center',
    color: colorScheme.textLight,
  },
}); 