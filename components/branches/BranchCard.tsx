// BranchCard.tsx
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Branch } from '@/types/branch';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GradientBackground } from '../ui/GradientBackground';

interface BranchCardProps {
  branch: Branch;
  onEdit: () => void;
  onDelete: () => void;
}

function BranchOptionsMenu({ onEdit, onDelete, isVisible, onClose, colorScheme }: any) {
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[
          styles.optionsMenu, 
          { backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF' }
        ]}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              onClose();
              onEdit();
            }}
          >
            <MaterialIcons
              name="edit"
              size={20}
              color={isDark ? '#4CAF50' : '#1976D2'}
            />
            <ThemedText style={[
              styles.menuText,
              { color: isDark ? '#FFFFFF' : '#2C3E50' }
            ]}>
              Düzəliş et
            </ThemedText>
          </TouchableOpacity>
          
          <View style={[
            styles.menuDivider,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }
          ]} />
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              onClose();
              onDelete();
            }}
          >
            <MaterialIcons
              name="delete"
              size={20}
              color="#F44336"
            />
            <ThemedText style={[styles.menuText, { color: '#F44336' }]}>
              Sil
            </ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export function BranchCard({ branch, onEdit, onDelete }: BranchCardProps) {
  const [showOptions, setShowOptions] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <GradientBackground intensity="light" />
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(25, 118, 210, 0.08)' }
          ]}>
            <MaterialIcons
              name="store"
              size={24}
              color={isDark ? '#FFFFFF' : '#1976D2'}
            />
          </View>
          
          <View style={styles.textContainer}>
            <ThemedText type="defaultSemiBold" style={styles.name}>
              {branch.name}
            </ThemedText>
            <ThemedText style={styles.type}>
              {branch.type}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => setShowOptions(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name="more-vert"
              size={24}
              color={isDark ? '#FFFFFF' : '#2C3E50'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <BranchOptionsMenu
        isVisible={showOptions}
        onClose={() => setShowOptions(false)}
        onEdit={onEdit}
        onDelete={onDelete}
        colorScheme={colorScheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    letterSpacing: -0.5,
  },
  type: {
    fontSize: 14,
    opacity: 0.7,
  },
  optionsButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsMenu: {
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
  },
  menuDivider: {
    height: 1,
  },
});