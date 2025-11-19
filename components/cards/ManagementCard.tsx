import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Cake, ChevronRight } from 'lucide-react-native';
import { styles } from '@/components/ui/styles/index.styles';

interface ManagementCardProps {
  onPress?: () => void;
  isDarkMode: boolean;
  theme: {
    card: string;
    text: string;
    textSubtle: string;
  };
  primaryColor: string;
}

export const ManagementCard: React.FC<ManagementCardProps> = ({
  onPress,
  isDarkMode,
  theme,
  primaryColor,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.card,
      styles.managementCard,
      { backgroundColor: theme.card, shadowColor: isDarkMode ? 'transparent' : 'rgba(0,0,0,0.1)' }
    ]}
    activeOpacity={0.9}
  >
    <View style={styles.managementContent}>
      <View style={styles.managementIconText}>
        <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}20` }]}>
          <Cake size={28} color={primaryColor} />
        </View>
        <View style={styles.managementText}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Məhsulları İdarə Et</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSubtle }]}>
            Yeni məhsul əlavə et və ya redaktə et
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={theme.textSubtle} />
    </View>
  </TouchableOpacity>
);

