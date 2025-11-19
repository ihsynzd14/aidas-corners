import { Tabs } from 'expo-router';
import React from 'react';


export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Completely hide React Navigation tab bar
        },
      }}
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

