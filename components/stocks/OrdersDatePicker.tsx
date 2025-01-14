import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign} from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { formatDate } from '@/utils/firebase';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GradientBackground } from '@/components/ui/GradientBackground';

interface OrdersDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function OrdersDatePicker({ selectedDate, onDateChange }: OrdersDatePickerProps) {
  const colorScheme = useColorScheme();
  const [showPicker, setShowPicker] = useState(false);
  const iconColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;

  const handleChange = (_: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) onDateChange(date);
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    onDateChange(newDate);
  };

  return (
    <ThemedView style={styles.outerContainer}>
      <GradientBackground intensity="strong" />
      <ThemedView style={styles.container}>
        <TouchableOpacity 
          onPress={handlePreviousDay} 
          style={styles.iconButton}
        >
          <AntDesign name="leftcircleo" size={20} color={iconColor} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setShowPicker(true)}
          style={styles.dateButton}
        >
          <ThemedText style={styles.dateText}>
            {formatDate(selectedDate)}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleNextDay} 
          style={styles.iconButton}
        >
          <AntDesign name="rightcircleo" size={20} color={iconColor} />
        </TouchableOpacity>

        {(showPicker || Platform.OS === 'ios') && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            style={Platform.OS === 'ios' ? styles.iOSPicker : undefined}
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
    backgroundColor: 'transparent',
  },
  iconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    minWidth: 140,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  iOSPicker: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
  }
});