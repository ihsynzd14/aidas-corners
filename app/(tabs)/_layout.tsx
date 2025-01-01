import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabIcon } from '@/components/ui/navigation/TabIcon';
import { TabLabel } from '@/components/ui/navigation/TabLabel';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: (props) => <HapticTab {...props} />,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          ...styles.tabBar,
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : PastryColors.cream,
          borderTopColor: colorScheme === 'dark' ? '#2D2D2D' : 'rgba(0,0,0,0.05)',
        },
        tabBarIcon: ({ color, focused }) => (
          <TabIcon
            name={
              route.name === 'index' 
                ? 'house.fill' 
                : route.name === 'new_orders'
                ? 'cart.fill'
                : 'paperplane.fill'
            }
            color={color}
            focused={focused}
          />
        ),
        tabBarLabel: ({ focused, color }) => (
          <TabLabel
            label={
              route.name === 'index' 
                ? 'Home' 
                : route.name === 'new_orders'
                ? 'Sifarişlər'
                : 'Filiallar'
            }
            color={color}
            focused={focused}
          />
        )
      })}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="new_orders"
        options={{
          title: 'Sifarişlər',
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    ...Platform.select({
      ios: {
        backgroundColor: 'transparent',
      }
    })
  }
});