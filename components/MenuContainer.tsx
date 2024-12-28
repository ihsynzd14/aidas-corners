import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconSymbol, IconSymbolName } from './ui/IconSymbol';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GradientBackground } from './ui/GradientBackground';
import { Colors, PastryColors } from '@/constants/Colors';

interface MenuContainerProps {
  title: string;
  description: string;
  iconName: IconSymbolName;
  onPress: () => void;
  delay?: number;
  compact?: boolean;
}

export function MenuContainer({ 
  title, 
  description, 
  iconName, 
  onPress, 
  compact = false
}: MenuContainerProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <GradientBackground intensity={compact ? 'light' : 'medium'} />
        <TouchableOpacity 
          onPress={onPress}
          style={styles.touchable}
          activeOpacity={0.7}
        >
          <ThemedView style={styles.content}>
            <ThemedView style={styles.header}>
              <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
              <ThemedText style={styles.description}>{description}</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.iconContainer}>
              <IconSymbol
                name={iconName}
                size={compact ? 44 : 52}
                color={colorScheme === 'dark' ? Colors.dark.icon : PastryColors.chocolate}
              />
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 6,
  },
  container: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  touchable: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  header: {
    gap: 6,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    opacity: 0.85,
    lineHeight: 18,
  },
  iconContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 4,
    backgroundColor: 'transparent',
  }
});