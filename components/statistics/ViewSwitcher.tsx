import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PastryColors } from '@/constants/Colors';

interface ViewSwitcherProps {
  viewMode: 'summary' | 'daily';
  setViewMode: (mode: 'summary' | 'daily') => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  viewMode,
  setViewMode,
}) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <ThemedView style={[
      styles.viewSwitchContainer,
      {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,53,49,0.02)',
        borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
      }
    ]}>
      <TouchableOpacity 
        style={[
          styles.viewSwitchButton, 
          {
            backgroundColor: isDark 
              ? viewMode === 'summary' 
                ? PastryColors.chocolate 
                : 'rgba(255,255,255,0.08)'
              : viewMode === 'summary'
                ? PastryColors.chocolate
                : 'rgba(74,53,49,0.08)'
          }
        ]}
        onPress={() => setViewMode('summary')}
      >
        <ThemedText style={[
          styles.viewSwitchText,
          { 
            color: viewMode === 'summary'
              ? '#fff'
              : isDark 
                ? 'rgba(255,255,255,0.8)'
                : PastryColors.chocolate
          }
        ]}>
          Ümumi Baxış
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.viewSwitchButton,
          {
            backgroundColor: isDark 
              ? viewMode === 'daily' 
                ? PastryColors.chocolate 
                : 'rgba(255,255,255,0.08)'
              : viewMode === 'daily'
                ? PastryColors.chocolate
                : 'rgba(74,53,49,0.08)'
          }
        ]}
        onPress={() => setViewMode('daily')}
      >
        <ThemedText style={[
          styles.viewSwitchText,
          { 
            color: viewMode === 'daily'
              ? '#fff'
              : isDark 
                ? 'rgba(255,255,255,0.8)'
                : PastryColors.chocolate
          }
        ]}>
          Tək Filial Baxış
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  viewSwitchContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  viewSwitchButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  viewSwitchText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 