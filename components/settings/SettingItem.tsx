import { StyleSheet, Switch, TouchableOpacity, Platform } from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GradientBackground } from '../ui/GradientBackground';

interface SettingItemProps {
  title: string;
  description: string;
  icon: IconSymbolName;
  isSwitch?: boolean;
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  disabled?: boolean;
}

export function SettingItem({ 
  title, 
  description, 
  icon, 
  isSwitch = false,
  value = false,
  onPress = () => {},
  onToggle = () => {},
  disabled = false
}: SettingItemProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Wrapper for switch to handle touch events properly
  const handleSwitchPress = () => {
    if (!disabled && isSwitch) {
      onToggle(!value);
    }
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (isSwitch) {
      return (
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={handleSwitchPress}
          disabled={disabled}
          style={styles.settingItem}
        >
          {children}
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={onPress}
        disabled={disabled}
        style={styles.settingItem}
      >
        {children}
      </TouchableOpacity>
    );
  };

  return (
    <Wrapper>
      <GradientBackground intensity="light" />
      <ThemedView style={styles.settingContent}>
        <ThemedView style={[
          styles.iconContainer,
          disabled && styles.disabledIcon
        ]}>
          <IconSymbol
            name={icon}
            size={24}
            color={isDarkMode 
              ? PastryColors.vanilla 
              : PastryColors.chocolate
            }
          />
        </ThemedView>
        
        <ThemedView style={styles.textContainer}>
          <ThemedText 
            type="defaultSemiBold" 
            style={[
              styles.title,
              disabled && styles.disabledText
            ]}
          >
            {title}
          </ThemedText>
          <ThemedText 
            style={[
              styles.description,
              disabled && styles.disabledText
            ]}
          >
            {description}
          </ThemedText>
        </ThemedView>

        {isSwitch ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            disabled={disabled}
            ios_backgroundColor={isDarkMode ? '#333' : '#E9E9EA'}
            trackColor={{ 
              false: isDarkMode ? '#333' : '#E9E9EA',
              true: isDarkMode ? PastryColors.primary : PastryColors.primary
            }}
            thumbColor={Platform.OS === 'ios' 
              ? '#FFFFFF'
              : value 
                ? PastryColors.vanilla
                : '#F4F4F4'
            }
          />
        ) : (
          <IconSymbol
            name="chevron.right"
            size={20}
            color={disabled 
              ? (isDarkMode ? '#666' : '#CCC')
              : (isDarkMode ? Colors.dark.icon : Colors.light.icon)
            }
          />
        )}
      </ThemedView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  disabledIcon: {
    opacity: 0.5,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
    lineHeight: 18,
  },
  disabledText: {
    opacity: 0.4,
  }
});