import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useResponsiveTabs } from '@/hooks/useResponsiveTabs';
import { TabLabel } from '@/components/ui/navigation/TabLabel';
import { PastryIcon } from '@/components/ui/icons/PastryIcon';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];

  // Responsive configuration for tabs
  useResponsiveTabs(6, {
    minTabWidth: 60,
    priorityTabs: 3, // First 3 tabs are always visible
    containerPadding: 16,
  });

  const getIconName = (routeName: string) => {
    const iconMap: { [key: string]: 'home' | 'orders' | 'table' | 'statistics' | 'analytics' | 'ai' } = {
      'index': 'home',
      'new_orders': 'orders',
      'orders_summary': 'table',
      'product_statistics': 'statistics',
      'analytics': 'analytics',
      'ai_assistant': 'ai',
    };
    return iconMap[routeName] || 'home';
  };

  const getLabel = (routeName: string) => {
    const labelMap: { [key: string]: string } = {
      'index': 'Ana Səhifə',
      'new_orders': 'Sifarişlər',
      'orders_summary': 'Cədvəl',
      'product_statistics': 'Statistika',
      'analytics': 'Analizlər',
      'ai_assistant': 'AI Asistan',
    };
    return labelMap[routeName] || '';
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarButton: (props) => <HapticTab {...props} />,
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colors.tabBackground,
          borderTopColor: colors.tabBorder,
          // Remove all shadow and elevation for clean look
          elevation: 0,
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowOffset: { width: 0, height: 0 },
        },
        tabBarItemStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        minHeight: 44, // Accessibility minimum touch target
      },
        tabBarIcon: ({ focused, color }) => {
          const iconName = getIconName(route.name);
          return (
            <PastryIcon
              name={iconName}
              size={24}
              color={color}
              focused={focused}
            />
          );
        },
        tabBarLabel: ({ focused, color }) => {
          const label = getLabel(route.name);
          return label ? <TabLabel label={label} color={color} focused={focused} /> : null;
        }
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Səhifə'
        }}
      />
      <Tabs.Screen
        name="new_orders"
        options={{
          title: 'Sifarişlər'
        }}
      />
      <Tabs.Screen
        name="orders_summary"
        options={{
          title: 'Cədvəl'
        }}
      />
      <Tabs.Screen
        name="product_statistics"
        options={{
          title: 'Statistika'
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analizlər'
        }}
      />
      <Tabs.Screen
        name="ai_assistant"
        options={{
          title: 'AI Asistan',
          headerShown: false
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Clean, minimal style without shadows
  }
});