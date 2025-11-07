import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack , router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Platform, View, LogBox } from 'react-native';
import * as Updates from 'expo-updates';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '@/services/NotificationService';
import AppUpdater from '@/components/AppUpdater';
import Constants from 'expo-constants';

// Expo Go'da remote push notification uyarısını bastır
if (__DEV__ && Constants.appOwnership === 'expo') {
  LogBox.ignoreLogs([
    'expo-notifications',
    'Android Push notifications',
    'remote notifications',
  ]);
}

// Bildirim ayarlarını yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
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
      try {
        // Expo Go kontrolü - sadece local notifications kullan
        const isExpoGo = Constants.appOwnership === 'expo';
        
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Bildirim izni reddedildi!');
          return;
        }

        if (isExpoGo) {
          console.log('✅ Local notifications aktif (Expo Go modunda)');
        }

        // Bildirim servisini başlat
        NotificationService.getInstance();
      } catch (error) {
        console.log('Bildirim kurulumu atlandı:', error);
      }
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
        <StatusBar hidden style={colorScheme === 'dark' ? 'light' : 'dark'} translucent backgroundColor='transparent' />
        <AppUpdater />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}