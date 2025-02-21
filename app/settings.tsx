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

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedApiKey = await AsyncStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
    } catch (error) {
      console.error('API anahtarı yüklenirken xəta:', error);
    }
  };

  const handleApiKeySave = async () => {
    try {
      await AsyncStorage.setItem('gemini_api_key', apiKey);
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


          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>AI Tənzimləmələri</ThemedText>
            <ThemedView style={styles.apiKeyContainer}>
              <ThemedText style={styles.apiKeyLabel}>Gemini API Açarı</ThemedText>
              <TextInput
                style={[
                  styles.apiKeyInput,
                  { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#444' : '#ddd' }
                ]}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="API açarını daxil edin"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                secureTextEntry
              />
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: isDarkMode ? '#492500' : '#efc4c4' }]}
                onPress={handleApiKeySave}
              >
                <ThemedText>Yadda Saxla</ThemedText>
              </TouchableOpacity>
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
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  apiKeyLabel: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  apiKeyInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});