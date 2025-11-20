import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, useColorScheme, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '@/utils/firebase';
import { colorScheme } from '@/constants/colorScheme';
import { BlurView } from 'expo-blur';

interface DateRangePickerModalProps {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  startDate: Date;
  endDate: Date;
  onConfirm: (start: Date, end: Date) => void;
}

export const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  bottomSheetRef,
  startDate,
  endDate,
  onConfirm,
}) => {
  const nativeColorScheme = useColorScheme();
  const isDark = nativeColorScheme === 'dark';

  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null);

  const handleConfirm = () => {
    onConfirm(tempStartDate, tempEndDate);
    bottomSheetRef.current?.dismiss();
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setActiveField(null);
    bottomSheetRef.current?.dismiss();
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempStartDate(selectedDate);
      if (selectedDate > tempEndDate) {
        setTempEndDate(selectedDate);
      }
    }
    setActiveField(null);
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (selectedDate >= tempStartDate) {
        setTempEndDate(selectedDate);
      }
    }
    setActiveField(null);
  };

  const bgColor = isDark ? colorScheme.cardDark : colorScheme.cardLight;
  const textColor = isDark ? colorScheme.textDark : colorScheme.textLight;
  const subtleColor = isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight;
  const borderColor = isDark ? 'rgba(255, 148, 148, 0.2)' : 'rgba(255, 148, 148, 0.15)';

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['50%', '60%']}
      backdropComponent={(props) => (
        <BottomSheetBackdrop 
          {...props} 
          disappearsOnIndex={-1} 
          appearsOnIndex={0}
          opacity={1}
          pressBehavior="close"
          style={[{ backgroundColor: 'rgba(0,0,0,0.4)' }, StyleSheet.absoluteFill]}
        >
           {Platform.OS === 'ios' || Platform.OS === 'android' ? (
             <BlurView 
               style={StyleSheet.absoluteFill} 
               intensity={15} 
               tint="dark"
             />
           ) : null}
        </BottomSheetBackdrop>
      )}
      backgroundStyle={{ backgroundColor: bgColor }}
      handleIndicatorStyle={{ backgroundColor: subtleColor }}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="date-range" size={24} color={colorScheme.primary} />
          <Text style={[styles.title, { color: textColor }]}>Tarix Aralığı Seçin</Text>
        </View>

        {/* Date Fields */}
        <View style={styles.dateFieldsContainer}>
          {/* Start Date */}
          <TouchableOpacity
            style={[
              styles.dateField,
              { 
                backgroundColor: isDark ? 'rgba(255, 148, 148, 0.1)' : 'rgba(255, 148, 148, 0.05)',
                borderColor: activeField === 'start' ? colorScheme.primary : borderColor,
                borderWidth: 2,
              }
            ]}
            onPress={() => setActiveField('start')}
          >
            <View style={styles.dateFieldContent}>
              <Text style={[styles.dateLabel, { color: subtleColor }]}>Başlanğıc</Text>
              <Text style={[styles.dateValue, { color: textColor }]}>{formatDate(tempStartDate)}</Text>
            </View>
            <MaterialIcons name="calendar-today" size={20} color={colorScheme.primary} />
          </TouchableOpacity>

          {/* Arrow */}
          <MaterialIcons name="arrow-forward" size={24} color={subtleColor} />

          {/* End Date */}
          <TouchableOpacity
            style={[
              styles.dateField,
              { 
                backgroundColor: isDark ? 'rgba(255, 148, 148, 0.1)' : 'rgba(255, 148, 148, 0.05)',
                borderColor: activeField === 'end' ? colorScheme.primary : borderColor,
                borderWidth: 2,
              }
            ]}
            onPress={() => setActiveField('end')}
          >
            <View style={styles.dateFieldContent}>
              <Text style={[styles.dateLabel, { color: subtleColor }]}>Son</Text>
              <Text style={[styles.dateValue, { color: textColor }]}>{formatDate(tempEndDate)}</Text>
            </View>
            <MaterialIcons name="calendar-today" size={20} color={colorScheme.primary} />
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        {activeField === 'start' && (
          <DateTimePicker
            value={tempStartDate}
            mode="date"
            onChange={handleStartDateChange}
            maximumDate={new Date()}
          />
        )}

        {activeField === 'end' && (
          <DateTimePicker
            value={tempEndDate}
            mode="date"
            onChange={handleEndDateChange}
            minimumDate={tempStartDate}
            maximumDate={new Date()}
          />
        )}

        {/* Quick Selections */}
        <View style={styles.quickSelectContainer}>
          <Text style={[styles.quickSelectTitle, { color: subtleColor }]}>Sürətli Seçim</Text>
          <View style={styles.quickSelectButtons}>
            <TouchableOpacity
              style={[styles.quickSelectButton, { backgroundColor: isDark ? 'rgba(255, 148, 148, 0.15)' : 'rgba(255, 148, 148, 0.1)' }]}
              onPress={() => {
                const today = new Date();
                setTempStartDate(today);
                setTempEndDate(today);
              }}
            >
              <Text style={[styles.quickSelectButtonText, { color: textColor }]}>Bugün</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickSelectButton, { backgroundColor: isDark ? 'rgba(255, 148, 148, 0.15)' : 'rgba(255, 148, 148, 0.1)' }]}
              onPress={() => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                setTempStartDate(weekAgo);
                setTempEndDate(today);
              }}
            >
              <Text style={[styles.quickSelectButtonText, { color: textColor }]}>Son 7 gün</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickSelectButton, { backgroundColor: isDark ? 'rgba(255, 148, 148, 0.15)' : 'rgba(255, 148, 148, 0.1)' }]}
              onPress={() => {
                const today = new Date();
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                setTempStartDate(monthAgo);
                setTempEndDate(today);
              }}
            >
              <Text style={[styles.quickSelectButtonText, { color: textColor }]}>Son 30 gün</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: borderColor }]}
            onPress={handleCancel}
          >
            <Text style={[styles.cancelButtonText, { color: subtleColor }]}>İmtina</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: colorScheme.accentRed }]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Tətbiq Et</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateFieldsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  dateField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  dateFieldContent: {
    gap: 4,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  quickSelectContainer: {
    marginBottom: 24,
  },
  quickSelectTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickSelectButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickSelectButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickSelectButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
