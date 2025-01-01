// src/components/OrderCorrection.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { correctOrderText } from '../../utils/orderCorrection';

interface OrderCorrectionProps {
  value: string;
  onValueChange: (text: string) => void;
  onCorrectedValueChange: (text: string) => void;
  isFocused: boolean;
}

export function OrderCorrection({ 
  value, 
  onValueChange, 
  onCorrectedValueChange,
  isFocused 
}: OrderCorrectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Debounce the correction to avoid unnecessary processing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        const correctedText = correctOrderText(value);
        onCorrectedValueChange(correctedText);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [value, onCorrectedValueChange]);

  return (
    <ThemedView 
      style={[
        styles.textAreaContainer,
        isDark ? styles.textAreaContainerDark : styles.textAreaContainerLight,
        styles.elevation,
        isFocused && styles.textAreaContainerFocused
      ]}
    >
      <TextInput
        style={[
          styles.textArea,
          { color: isDark ? Colors.dark.text : Colors.light.text }
        ]}
        multiline
        numberOfLines={10}
        placeholder="WhatsApp sifarişini buraya yapışdırın..."
        placeholderTextColor={isDark ? '#666' : '#999'}
        value={value}
        onChangeText={onValueChange}
        textAlignVertical="top"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  textAreaContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textAreaContainerLight: {
    backgroundColor: '#fff',
    borderColor: PastryColors.chocolate,
  },
  textAreaContainerDark: {
    backgroundColor: '#2A2A2A',
    borderColor: PastryColors.chocolate,
  },
  textAreaContainerFocused: {
    borderColor: PastryColors.chocolate,
  },
  elevation: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 1,
    },
  }) as ViewStyle,
  textArea: {
    padding: 16,
    minHeight: 200,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,
});