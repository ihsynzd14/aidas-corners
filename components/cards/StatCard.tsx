import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '@/components/ui/styles/index.styles';

interface StatCardProps {
  title: string;
  subtitle?: string;
  count?: string | number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  onPress?: () => void;
  aspectRatio?: boolean;
  isDarkMode: boolean;
  theme: {
    card: string;
    text: string;
    textSubtle: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  subtitle,
  count,
  icon: Icon,
  color,
  onPress,
  aspectRatio = true,
  isDarkMode,
  theme,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.card,
      aspectRatio && styles.compactCard,
      { backgroundColor: theme.card, shadowColor: isDarkMode ? 'transparent' : 'rgba(0,0,0,0.1)' }
    ]}
    activeOpacity={0.9}
  >
    <View style={styles.cardHeader}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Icon size={28} color={color} />
      </View>
      {count && (
        <Text style={[styles.count, { color, fontWeight: '700', fontSize: 20 }]}>
          {count}
        </Text>
      )}
    </View>

    <View style={styles.cardContent}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.cardSubtitle, { color : theme.textSubtle }]}>
          {subtitle}
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

