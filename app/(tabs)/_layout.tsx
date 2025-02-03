import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors, PastryColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabLabel } from '@/components/ui/navigation/TabLabel';

type AntDesignName = keyof typeof AntDesign.glyphMap;

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
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIcon: ({ color }) => {
          let iconName: AntDesignName;
          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'new_orders') {
            iconName = 'shoppingcart';
          } else if (route.name === 'orders_summary') {
            iconName = 'profile';
          } else if (route.name === 'ai_assistant') {
            iconName = 'API';
          } else if (route.name === 'product_statistics') {
            iconName = 'barschart';
          } else {
            return null;
          }
          return <AntDesign name={iconName} size={24} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          let label = '';
          if (route.name === 'index') {
            label = 'Ana Səhifə';
          } else if (route.name === 'new_orders') {
            label = 'Sifarişlər';
          } else if (route.name === 'orders_summary') {
            label = 'Cədvəl';
          } else if (route.name === 'ai_assistant') {
            label = 'AI Asistan';
          } else if (route.name === 'product_statistics') {
            label = 'Statistika';
          }
          return label ? <TabLabel label={label} color={color} focused={focused} /> : null;
        }
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Ana Səhifə' }} />
      <Tabs.Screen name="new_orders" options={{ title: 'Sifarişlər' }} />
      <Tabs.Screen name="orders_summary" options={{ title: 'Cədvəl' }} />
      <Tabs.Screen name="product_statistics" options={{ title: 'Statistika' }} />
      <Tabs.Screen name="ai_assistant" options={{ title: 'AI Asistan', headerShown: false }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        backgroundColor: 'transparent',
      }
    })
  }
});