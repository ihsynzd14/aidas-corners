import { Stack } from 'expo-router';
import { Appearance, StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { TopBar } from '@/components/TopBar';
import { SettingItem } from '@/components/settings/SettingItem';
import { ThemedText } from '@/components/ThemedText';
import { NotificationService } from '@/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [apiKey, setApiKey] = useState('');
  const [notificationTimes, setNotificationTimes] = useState<Array<{ type: string; hour: number; minute: number }>>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [groqApiKey, setGroqApiKey] = useState('');
  const [openrouterApiKey, setOpenrouterApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  useEffect(() => {
    loadApiKeys();
    loadNotificationTimes();
  }, []);

  const loadApiKeys = async () => {
    try {
      const savedGroqKey = await AsyncStorage.getItem('groq_api_key') || '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';
      const savedOpenrouterKey = await AsyncStorage.getItem('openrouter_api_key') || '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';
      const savedGeminiKey = await AsyncStorage.getItem('gemini_api_key') || 'AIzaSyCFJn84h0V3mMwP2Vaa7_T18Ul2ALrvHsU';
      
      setGroqApiKey(savedGroqKey);
      setOpenrouterApiKey(savedOpenrouterKey);
      setGeminiApiKey(savedGeminiKey);
    } catch (error) {
      console.error('API anahtarları yüklenirken xəta:', error);
    }
  };

  const loadNotificationTimes = async () => {
    const notificationService = NotificationService.getInstance();
    const times = await notificationService.getNotificationTimes();
    setNotificationTimes(times);
  };

  const handleApiKeySave = async (type: 'groq' | 'openrouter' | 'gemini', value: string) => {
    try {
      const key = `${type}_api_key`;
      await AsyncStorage.setItem(key, value);
      Alert.alert('Uğurlu', 'API açarı uğurla yeniləndi');
    } catch (error) {
      Alert.alert('Xəta', 'API açarı yenilənərkən xəta baş verdi');
    }
  };

  const handleThemeToggle = (value: boolean) => {
    requestAnimationFrame(() => {
      Appearance.setColorScheme(value ? 'dark' : 'light');
    });
  };

  const handleTestNotification = async (type: 'comparison' | 'topSelling' | 'insight') => {
    const notificationService = NotificationService.getInstance();
    await notificationService.sendNotification(type);
  };

  const handleTimeChange = async (type: 'comparison' | 'topSelling' | 'insight', hour: number, minute: number) => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.setNotificationTime(type, hour, minute);
      await loadNotificationTimes();
      Alert.alert('Uğurlu', 'Bildiriş zamanı yeniləndi');
    } catch (error) {
      Alert.alert('Xəta', 'Bildiriş zamanı yenilənərkən xəta baş verdi');
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'comparison':
        return 'Həftəlik Müqayisə';
      case 'topSelling':
        return 'Ən Çox Satılanlar';
      case 'insight':
        return 'Gündəlik Analiz';
      default:
        return '';
    }
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <TopBar 
        title="Tənzimləmələr"
        style={styles.topBar}
      />
      
      <ScrollView>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Görünüş</ThemedText>
            <SettingItem
              title="Qaranlıq Rejim"
              description="İşıqlı və qaranlıq mövzu arasında keçid"
              icon="gearshape.fill"
              isSwitch={true}
              value={isDarkMode}
              onToggle={handleThemeToggle}
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>İdarəetmə</ThemedText>
            <SettingItem
              title="Filiallar"
              description="Filialları idarə edin"
              icon="box.truck.fill"
              onPress={() => router.push('/pages/branches')}
            />
            <SettingItem
              title="Məhsullar"
              description="Məhsul siyahısını idarə edin"
              icon="cart.fill"
              onPress={() => router.push('/pages/products_list')}
            />
            <SettingItem
              title="Ərzaqlar"
              description="Ərzaqları idarə edin"
              icon="cart.fill"
              onPress={() => router.push('/pages/needs')}
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Ümumi</ThemedText>
            <SettingItem
              title="Dil"
              description="Tətbiq dilini dəyişin"
              icon="list.clipboard.fill"
            />
            <SettingItem
              title="Haqqında"
              description="Tətbiq məlumatları və versiya"
              icon="cart.fill"
            />
          </ThemedView>
   {/*
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Bildiriş Testləri</ThemedText>
            
            <SettingItem
              title="📊 Həftəlik Müqayisə Bildirişi"
              description="Ötən həftə ilə müqayisəli satış analizi"
              icon="bell.fill"
              onPress={() => handleTestNotification('comparison')}
            />

            <SettingItem
              title="🏆 Ən Çox Satılanlar Bildirişi"
              description="Həftənin ən populyar məhsulları"
              icon="bell.fill"
              onPress={() => handleTestNotification('topSelling')}
            />

            <SettingItem
              title="📈 Gündəlik Analiz Bildirişi"
              description="Bu günün ən yaxşı filialı və satış məlumatları"
              icon="bell.fill"
              onPress={() => handleTestNotification('insight')}
            />
          </ThemedView>
   */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Bildiriş Zamanları</ThemedText>
            {notificationTimes.map((notification) => (
              <SettingItem
                key={notification.type}
                title={getNotificationTitle(notification.type)}
                description={`Bildiriş zamanı: ${formatTime(notification.hour, notification.minute)}`}
                icon="bell.fill"
                onPress={() => {
                  setSelectedType(notification.type);
                  setShowTimePicker(true);
                }}
              />
            ))}
            {showTimePicker && selectedType && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (event.type === 'set' && selectedDate) {
                    handleTimeChange(
                      selectedType as 'comparison' | 'topSelling' | 'insight',
                      selectedDate.getHours(),
                      selectedDate.getMinutes()
                    );
                  }
                }}
              />
            )}
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>AI Tənzimləmələri</ThemedText>
            
            <ThemedView style={styles.apiKeyContainer}>
              <View style={styles.apiKeyRow}>
                <ThemedText style={styles.apiKeyLabel}>Groq</ThemedText>
                <TextInput
                  style={[
                    styles.apiKeyInput,
                    { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#444' : '#ddd' }
                  ]}
                  value={groqApiKey}
                  onChangeText={setGroqApiKey}
                  placeholder="API açarı"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                />
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: isDarkMode ? '#492500' : '#efc4c4' }]}
                  onPress={() => handleApiKeySave('groq', groqApiKey)}
                >
                  <ThemedText>✓</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={[styles.apiKeyRow, { marginTop: 8 }]}>
                <ThemedText style={styles.apiKeyLabel}>OpenRouter</ThemedText>
                <TextInput
                  style={[
                    styles.apiKeyInput,
                    { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#444' : '#ddd' }
                  ]}
                  value={openrouterApiKey}
                  onChangeText={setOpenrouterApiKey}
                  placeholder="API açarı"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                />
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: isDarkMode ? '#492500' : '#efc4c4' }]}
                  onPress={() => handleApiKeySave('openrouter', openrouterApiKey)}
                >
                  <ThemedText>✓</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={[styles.apiKeyRow, { marginTop: 8 }]}>
                <ThemedText style={styles.apiKeyLabel}>Gemini</ThemedText>
                <TextInput
                  style={[
                    styles.apiKeyInput,
                    { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#444' : '#ddd' }
                  ]}
                  value={geminiApiKey}
                  onChangeText={setGeminiApiKey}
                  placeholder="API açarı"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                />
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: isDarkMode ? '#492500' : '#efc4c4' }]}
                  onPress={() => handleApiKeySave('gemini', geminiApiKey)}
                >
                  <ThemedText>✓</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </ThemedView>

        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: 'grey',
    padding: 8,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  buttonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    textAlign: 'center',
  },
  apiKeyContainer: {
    padding: 8,
    borderRadius: 8,
  },
  apiKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apiKeyLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  apiKeyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
  },
  saveButton: {
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
  },
});