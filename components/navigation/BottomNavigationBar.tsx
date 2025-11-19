import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, usePathname } from 'expo-router';
import { Home, ShoppingCart, Package, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const colors = {
  primary: '#D9A6A3',
  cardLight: '#FFFBF8',
  cardDark: '#3D3A38',
  textSubtleLight: '#897E7C',
  textSubtleDark: '#A89F9A',
  white: '#FFFFFF',
};

interface BottomNavigationBarProps {
  isDarkMode?: boolean;
}

export default function BottomNavigationBar({ isDarkMode = false }: BottomNavigationBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname === '/(tabs)';
    }
    return pathname?.includes(path);
  };

  const tabs = [
    {
      icon: Home,
      label: 'Ana Səhifə',
      path: '/',
      onPress: () => router.push('/(tabs)'),
    },
    {
      icon: ShoppingCart,
      label: 'Yeni Sifarişlər',
      path: '/new_orders',
      onPress: () => router.push('/(tabs)/new_orders'),
    },
    {
      icon: Package,
      label: 'Stoklar və Hazırlıq',
      path: '/orders_summary',
      onPress: () => router.push('/(tabs)/orders_summary'),
    },
    {
      icon: Settings,
      label: 'Ayarlar',
      path: '/settings',
      onPress: () => router.push('/settings'),
    },
  ];

  const backgroundColor = isDarkMode 
    ? `${colors.cardDark}CC` 
    : `${colors.cardLight}CC`;

  const textSubtleColor = isDarkMode 
    ? colors.textSubtleDark 
    : colors.textSubtleLight;

  return (
    <View style={styles.outerContainer}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 0}
        tint={isDarkMode ? 'dark' : 'light'}
        style={[
          styles.blurContainer,
          { 
            backgroundColor,
            paddingBottom: insets.bottom  + 8
                 }
        ]}
      >
        <View style={styles.navContent}>
          {tabs.map((tab, index) => {
            const active = isActive(tab.path);
            const Icon = tab.icon;

            return (
              <TouchableOpacity
                key={index}
                onPress={tab.onPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                {active ? (
                  <View style={[styles.activeIconContainer, { backgroundColor: colors.primary }]}>
                    <Icon size={20} color={colors.white} />
                  </View>
                ) : (
                  <Icon size={24} color={textSubtleColor} />
                )}
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: active ? colors.primary : textSubtleColor,
                      fontWeight: active ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurContainer: {
    borderWidth: 0.05,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 12,
    marginLeft: 10,
    marginRight: 10,
    overflow: 'hidden',
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    gap: 4,
  },
  activeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
  },
});

