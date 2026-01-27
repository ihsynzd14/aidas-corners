import React, { useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, useColorScheme as useNativeColorScheme, Modal, Pressable, Animated, FlatList, Dimensions } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { colorScheme } from '@/constants/colorScheme';
import { ThemedText } from '@/components/ThemedText';

interface Option {
  id: string;
  label: string;
  subLabel?: string;
}

interface MultiSelectBottomSheetProps {
  visible: boolean;
  title: string;
  options: Option[];
  selectedValues: string[];
  onConfirm: (selected: string[]) => void;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;

export const MultiSelectBottomSheet: React.FC<MultiSelectBottomSheetProps> = ({
  visible,
  title,
  options,
  selectedValues,
  onConfirm,
  onClose,
}) => {
  const nativeColorScheme = useNativeColorScheme();
  const isDark = nativeColorScheme === 'dark';
  
  // Local state for temporary selection before confirming
  const [tempSelected, setTempSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    if (visible) {
      setTempSelected(selectedValues || []); // Initialize with current selection
      setShowModal(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowModal(false));
    }
  }, [visible, selectedValues]);

  const handleBackdropPress = () => {
    onClose();
  };

  const toggleSelection = (id: string) => {
    setTempSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (tempSelected.length === options.length) {
      setTempSelected([]);
    } else {
      setTempSelected(options.map(o => o.id));
    }
  };

  const handleConfirm = () => {
    onConfirm(tempSelected);
    onClose();
  };

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(opt => 
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const renderItem = ({ item }: { item: Option }) => {
    const isSelected = tempSelected.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: isDark ? colorScheme.cardDark : colorScheme.cardLight,
            borderColor: isSelected ? colorScheme.primary : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
          }
        ]}
        onPress={() => toggleSelection(item.id)}
      >
        <View style={styles.itemContent}>
          <Text style={[styles.itemLabel, { color: isDark ? colorScheme.textDark : colorScheme.textLight }]}>
            {item.label}
          </Text>
          {item.subLabel && (
            <Text style={[styles.itemSubLabel, { color: isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight }]}>
              {item.subLabel}
            </Text>
          )}
        </View>
        
        <View style={[
          styles.checkbox,
          {
            borderColor: isSelected ? colorScheme.primary : (isDark ? colorScheme.textSubtleDark : colorScheme.textSubtleLight),
            backgroundColor: isSelected ? colorScheme.primary : 'transparent',
          }
        ]}>
          {isSelected && <MaterialIcons name="check" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  if (!showModal) return null;

  return (
    <Modal visible={showModal} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <Animated.View style={[styles.backdropAnimated, { opacity: fadeAnim }]} />
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: isDark ? colorScheme.backgroundDark : colorScheme.backgroundLight,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={[styles.handleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]} />
            <View style={styles.headerTitleRow}>
              <Text style={[styles.title, { color: isDark ? colorScheme.textDark : colorScheme.textLight }]}>
                {title}
              </Text>
              <TouchableOpacity onPress={handleSelectAll}>
                <Text style={[styles.selectAllText, { color: colorScheme.primary }]}>
                  {tempSelected.length === options.length ? 'Hamsını ləğv et' : 'Hamsını seç'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={filteredOptions}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={[
            styles.footer,
            { 
              backgroundColor: isDark ? colorScheme.backgroundDark : colorScheme.backgroundLight,
              borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }
          ]}>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colorScheme.primary }]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>
                Təsdiq et ({tempSelected.length})
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropAnimated: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContainer: {
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  footer: {
    padding: 20,
    paddingBottom: 40, // for bottom safe area approx
    borderTopWidth: 1,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
