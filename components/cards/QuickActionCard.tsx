import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '@/components/ui/styles/index.styles';

interface QuickActionCardProps {
  title: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress?: () => void;
  isDarkMode: boolean;
  theme: {
    card: string;
    text: string;
  };
  primaryColor: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  icon: Icon,
  onPress,
  isDarkMode,
  theme,
  primaryColor,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.card,
      styles.quickActionCard,
      { backgroundColor: theme.card, shadowColor: isDarkMode ? 'transparent' : 'rgba(0,0,0,0.1)' }
    ]}
    activeOpacity={0.9}
  >
    <View style={[styles.iconContainer, styles.quickActionIcon, { backgroundColor: `${primaryColor}20` }]}>
      <Icon size={20} color={primaryColor} />
    </View>
    <Text style={[styles.quickActionTitle, { color: theme.text }]}>{title}</Text>
  </TouchableOpacity>
);

