import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface ViewSwitcherProps {
  viewMode: 'summary' | 'daily';
  setViewMode: (mode: 'summary' | 'daily') => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  viewMode,
  setViewMode,
}) => {
  return (
    <ThemedView style={styles.viewSwitchContainer}>
      <TouchableOpacity 
        style={[
          styles.viewSwitchButton, 
          viewMode === 'summary' && styles.activeViewButton
        ]}
        onPress={() => setViewMode('summary')}
      >
        <ThemedText style={[
          styles.viewSwitchText,
          viewMode === 'summary' && styles.activeViewText
        ]}>
          Ümumi Baxış
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.viewSwitchButton,
          viewMode === 'daily' && styles.activeViewButton
        ]}
        onPress={() => setViewMode('daily')}
      >
        <ThemedText style={[
          styles.viewSwitchText,
          viewMode === 'daily' && styles.activeViewText
        ]}>
          Günlük Baxış
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  viewSwitchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 53, 49, 0.1)',
  },
  viewSwitchButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: 'rgba(74, 53, 49, 0.05)',
  },
  activeViewButton: {
    backgroundColor: '#4A3531',
  },
  viewSwitchText: {
    fontSize: 14,
    color: '#4A3531',
    fontWeight: '600',
  },
  activeViewText: {
    color: '#fff',
  },
}); 