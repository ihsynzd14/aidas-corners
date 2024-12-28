import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';
import { PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface GradientBackgroundProps {
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
}

export function GradientBackground({ style, intensity = 'medium' }: GradientBackgroundProps) {
  const colorScheme = useColorScheme();
  
  const getGradientColors = (): [string, string] => {
    if (colorScheme === 'dark') {
      return ['#2D2220', '#3A2D2A'];
    }
    
    switch (intensity) {
      case 'light':
        return [PastryColors.vanilla, PastryColors.accent];
      case 'strong':
        return [PastryColors.secondary, PastryColors.primary];
      default:
        return [PastryColors.vanilla, PastryColors.accent];
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={[styles.gradient, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});