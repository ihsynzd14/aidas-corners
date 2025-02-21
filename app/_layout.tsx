import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Platform } from 'react-native';
import * as Updates from 'expo-updates';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '@/services/NotificationService';
import { router } from 'expo-router';

// Bildirim ayarlarını yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Bildirim izni reddedildi!');
        return;
      }

      // Bildirim servisini başlat
      NotificationService.getInstance();
    };

    setupNotifications();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      router.push('/notification_history');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: Platform.select({
              ios: 'default',
              android: 'fade_from_bottom',
              default: 'fade'
            }),
            animationDuration: 200,
          }}>
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              animation: 'fade',
            }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ 
              presentation: 'card',
              animation: Platform.select({
                ios: 'default',
                android: 'slide_from_right',
                default: 'fade'
              }),
            }} 
          />
          <Stack.Screen 
            name="+not-found" 
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} translucent hidden backgroundColor='transparent' />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}