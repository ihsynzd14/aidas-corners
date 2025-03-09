import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Groq } from 'groq-sdk';
import { AIAssistantUI } from '@/components/ai-assistant/ui/AIAssistantUI';
import { AIPromptManager } from '@/components/ai-assistant/core/AIPromptManager';
import { Message, DateRange, AIProvider } from '@/components/ai-assistant/core/types';
import { Animated, Alert, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, PastryColors } from '@/constants/Colors';

const API_KEYS = {
  groq: '',
  openrouter: '',
  gemini: ''
};

const API_BASE_URL = 'https://aidas-corners-springboot-production.up.railway.app/api';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export default function AiAssistant() {
  const [groqClient, setGroqClient] = useState<Groq | null>(null);
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);
  const [model, setModel] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [provider, setProvider] = useState<AIProvider>('groq');

  useEffect(() => {
    loadApiKeys();
  }, []);

  // Provider değiştiğinde AI'ı yeniden başlat
  useEffect(() => {
    if (API_KEYS.groq && API_KEYS.gemini && API_KEYS.openrouter) {
      initializeAI();
    }
  }, [provider]);

  const loadApiKeys = async () => {
    try {
      let savedGroqKey, savedOpenrouterKey, savedGeminiKey;
      
      try {
        savedGroqKey = await AsyncStorage.getItem('groq_api_key');
      } catch (e) {
        console.warn('Groq key yüklenirken hata:', e);
      }
      
      try {
        savedOpenrouterKey = await AsyncStorage.getItem('openrouter_api_key');
      } catch (e) {
        console.warn('Openrouter key yüklenirken hata:', e);
      }
      
      try {
        savedGeminiKey = await AsyncStorage.getItem('gemini_api_key');
      } catch (e) {
        console.warn('Gemini key yüklenirken hata:', e);
      }
      
      API_KEYS.groq = savedGroqKey || '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';
      API_KEYS.openrouter = savedOpenrouterKey || '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';
      API_KEYS.gemini = savedGeminiKey || 'AIzaSyC26TIDS26c5rve0bM2OQkkxEdoWNUtNhg';

      console.log('API Keys loaded:', {
        groq: API_KEYS.groq ? 'Loaded' : 'Using default',
        openrouter: API_KEYS.openrouter ? 'Loaded' : 'Using default',
        gemini: API_KEYS.gemini ? 'Loaded' : 'Using default'
      });

      initializeAI();
    } catch (error) {
      console.error('API anahtarları yüklenirken xəta:', error);
      Alert.alert('Xəta', 'API açarları yüklənərkən xəta baş verdi');
      
      // Hata durumunda varsayılan anahtarları kullan
      API_KEYS.groq = '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';
      API_KEYS.openrouter = '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';
      API_KEYS.gemini = 'AIzaSyC26TIDS26c5rve0bM2OQkkxEdoWNUtNhg';
      
      initializeAI();
    }
  };

  const initializeAI = async () => {
    try {
      let savedProvider;
      
      try {
        savedProvider = await AsyncStorage.getItem('ai_provider') as AIProvider;
        console.log('Saved provider loaded:', savedProvider);
      } catch (e) {
        console.warn('AI provider yüklenirken hata:', e);
      }
      
      const currentProvider = savedProvider || provider;
      
      if (savedProvider && savedProvider !== provider) {
        setProvider(savedProvider);
      }

      console.log('Initializing AI with provider:', currentProvider);

      switch (currentProvider) {
        case 'groq':
          try {
            const newGroqClient = new Groq({ apiKey: API_KEYS.groq });
            setGroqClient(newGroqClient);
            setModel(newGroqClient);
            setApiKey(API_KEYS.groq);
            console.log('Groq client initialized successfully');
          } catch (e) {
            console.error('Groq client başlatılırken hata:', e);
          }
          break;
        case 'gemini':
          try {
            const newGenAI = new GoogleGenerativeAI(API_KEYS.gemini);
            setGenAI(newGenAI);
            setModel(newGenAI);
            setApiKey(API_KEYS.gemini);
            console.log('Gemini client initialized successfully');
          } catch (e) {
            console.error('Gemini client başlatılırken hata:', e);
          }
          break;
        case 'openrouter':
          setApiKey(API_KEYS.openrouter);
          console.log('Openrouter API key set');
          break;
      }
    } catch (error) {
      console.error('AI başlatılırken xəta:', error);
      Alert.alert('Xəta', 'AI xidməti başladılarkən xəta baş verdi');
    }
  };

  const handleProviderChange = async (newProvider: AIProvider) => {
    await AsyncStorage.setItem('ai_provider', newProvider);
    setProvider(newProvider);
    setTimeout(() => {
      initializeAI();
    }, 100);
  };

  const getAIResponse = async (prompt: string) => {
    try {
      switch (provider) {
        case 'groq':
          if (!groqClient) {
            console.log('Groq client null, reinitializing...');
            const newGroqClient = new Groq({ apiKey: API_KEYS.groq });
            setGroqClient(newGroqClient);
            setModel(newGroqClient);
            
            const completion = await newGroqClient.chat.completions.create({
              messages: [{ role: 'user', content: prompt }],
              model: 'mixtral-8x7b-32768',
              temperature: 0.7,
              max_tokens: 2048,
            });
            return completion.choices[0]?.message?.content || '';
          }
          
          const completion = await groqClient.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'mixtral-8x7b-32768',
            temperature: 0.7,
            max_tokens: 2048,
          });
          return completion.choices[0]?.message?.content || '';

        case 'gemini':
          if (!genAI) {
            console.log('Gemini client null, reinitializing...');
            const newGenAI = new GoogleGenerativeAI(API_KEYS.gemini);
            setGenAI(newGenAI);
            setModel(newGenAI);
            
            const geminiModel = newGenAI.getGenerativeModel({ 
              model: "gemini-2.0-flash",
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
              }
            });
            
            try {
              const result = await geminiModel.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }]
              });
              const response = await result.response;
              return response.text();
            } catch (error) {
              console.error('Gemini API hatası (yeni format):', error);
              
              try {
                // Eski format ile deneyelim
                console.log('Eski format ile deneniyor...');
                const oldFormatModel = newGenAI.getGenerativeModel({ model: "gemini-1.5-pro" });
                const oldFormatResult = await oldFormatModel.generateContent(prompt);
                const oldFormatResponse = await oldFormatResult.response;
                return oldFormatResponse.text();
              } catch (oldError) {
                console.error('Gemini API hatası (eski format):', oldError);
                
                // Son çare olarak başka bir modeli deneyelim
                console.log('Son çare: gemini-pro');
                try {
                  const lastResortModel = newGenAI.getGenerativeModel({ model: "gemini-pro" });
                  const lastResortResult = await lastResortModel.generateContent(prompt);
                  const lastResortResponse = await lastResortResult.response;
                  return lastResortResponse.text();
                } catch (finalError) {
                  console.error('Tüm Gemini modelleri başarısız oldu:', finalError);
                  throw new Error('Gemini API ile bağlantı kurulamadı. Lütfen başka bir AI sağlayıcısı seçin.');
                }
              }
            }
          }
          
          const geminiModel = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 2048,
            }
          });
          
          try {
            const result = await geminiModel.generateContent({
              contents: [{ role: "user", parts: [{ text: prompt }] }]
            });
            const response = await result.response;
            return response.text();
          } catch (error) {
            console.error('Gemini API hatası:', error);
            // Yedek olarak başka bir modeli deneyelim
            console.log('Yedek model deneniyor: gemini-1.5-flash');
            const backupModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const backupResult = await backupModel.generateContent(prompt);
            const backupResponse = await backupResult.response;
            return backupResponse.text();
          }

        case 'openrouter':
          const openrouterResponse = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://aidascorner.com',
              'X-Title': 'Aidas Corner AI Assistant',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'deepseek/deepseek-r1:free',
              messages: [{ role: 'user', content: prompt }]
            })
          });

          if (!openrouterResponse.ok) {
            throw new Error('AI yanıtı alınamadı');
          }

          const completionData = await openrouterResponse.json();
          return completionData.choices[0]?.message?.content || '';
          
        default:
          throw new Error('Bilinməyən AI təchizatçısı');
      }
    } catch (error) {
      console.error('AI yanıtı alınırken xəta:', error);
      throw error;
    }
  };

  const handleSend = async (inputMessage: string) => {
    console.log('\n=== USER INTERACTION LOGS ===');
    console.log('Kullanıcı Mesajı:', inputMessage);
    console.log('AI Provider:', provider);

    const userMessage: Message = { 
      role: 'user', 
      content: inputMessage,
      timestamp: new Date(),
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20)
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    Animated.parallel([
      Animated.timing(userMessage.opacity!, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(userMessage.translateY!, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();

    try {
      const dateRange = extractDateRange(inputMessage);
      console.log('Çıkarılan Tarih Aralığı:', dateRange);

      let apiResponse;
      try {
        console.log('API çağrısı yapılıyor:', `${API_BASE_URL}/orders?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
        const response = await fetch(
          `${API_BASE_URL}/orders?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        );
        
        if (!response.ok) {
          console.error('API yanıtı başarısız:', response.status, response.statusText);
          throw new Error(`API yanıtı alınamadı: ${response.status} ${response.statusText}`);
        }

        apiResponse = await response.json();
        console.log('API yanıtı alındı:', Object.keys(apiResponse).length > 0 ? 'Veri var' : 'Veri yok');
      } catch (error) {
        console.error('API çağrısı hatası:', error);
        throw new Error(`API çağrısı başarısız: ${error instanceof Error ? error.message : String(error)}`);
      }

      const promptManager = AIPromptManager.getInstance();
      const context = promptManager.createContext(apiResponse);
      const prompt = promptManager.createPrompt(context, inputMessage, dateRange);

      let text;
      try {
        text = await getAIResponse(prompt);
        console.log('AI Yanıtı:', text ? 'Yanıt alındı' : 'Yanıt boş');
      } catch (error) {
        console.error('AI yanıtı alınırken hata:', error);
        throw new Error(`AI yanıtı alınamadı: ${error instanceof Error ? error.message : String(error)}`);
      }

      if (!text || text === 'undefined') {
        throw new Error('AI yanıtı boş veya geçersiz');
      }

      const isValid = promptManager.validateResponse(text, apiResponse);
      if (!isValid) {
        throw new Error('AI yanıtı doğrulama kontrolünden geçemedi');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: text.trim(),
        timestamp: new Date(),
        isTyping: true,
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(20)
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      Animated.parallel([
        Animated.timing(assistantMessage.opacity!, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(assistantMessage.translateY!, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();

    } catch (error) {
      console.error('İşlem Hatası:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Bağışlayın, bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
        timestamp: new Date(),
        opacity: new Animated.Value(1),
        translateY: new Animated.Value(0)
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const initialMessage: Message = {
    role: 'assistant',
    content: 'Salam! Mən Aida\'s Corner\'in AI köməkçisiyəm. Sizə satış təhlili və statistika mövzusunda kömək edə bilərəm.\n\nSuallarınızı aşağıdakı kateqoriyalarda verə bilərsiniz:\n\n• Sadə Suallar (Məs: "Neçə filial var?")\n• Orta Səviyyəli Suallar (Məs: "San Sebastian tortunun ümumi satışı nə qədərdir?")\n• Çətin Suallar (Məs: "Ən yüksək satışı olan 3 məhsulu tapın")\n\nDaha ətraflı məlumat üçün sağ yuxarıdakı sual işarəsinə klikləyin.',
    timestamp: new Date(),
    isTyping: true,
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20)
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // İlk mesaj için giriş animasyonu
    Animated.parallel([
      Animated.timing(initialMessage.opacity!, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(initialMessage.translateY!, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();

    // AI Prompt Manager'ı başlat
    const initAI = async () => {
      try {
        const promptManager = AIPromptManager.getInstance();
        await promptManager.initializeBranches();
      } catch (error) {
        console.error('AI başlatma hatası:', error);
      }
    };

    initAI();
  }, []);

  // Yardımcı fonksiyonlar
  const extractDateRange = (message: string): DateRange => {
    // Tarih aralığı formatı: DD.MM.YYYY - DD.MM.YYYY
    const dateRangeMatch = message.match(/(\d{2})\.(\d{2})\.(\d{4})\s*-\s*(\d{2})\.(\d{2})\.(\d{4})/);
    
    if (dateRangeMatch) {
      const [_, startDay, startMonth, startYear, endDay, endMonth, endYear] = dateRangeMatch;
      console.log('Tarih aralığı bulundu:', {
        start: `${startDay}.${startMonth}.${startYear}`,
        end: `${endDay}.${endMonth}.${endYear}`
      });
      
      return {
        startDate: `${startYear}-${startMonth}-${startDay}`,
        endDate: `${endYear}-${endMonth}-${endDay}`
      };
    }

    // Tek tarih formatı: DD.MM.YYYY
    const singleDateMatch = message.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (singleDateMatch) {
      const [_, day, month, year] = singleDateMatch;
      console.log('Tek tarih bulundu:', `${day}.${month}.${year}`);
      
      return {
        startDate: `${year}-${month}-${day}`,
        endDate: `${year}-${month}-${day}`
      };
    }

    // Tarih bulunamadıysa son 30 günü al
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    console.log('Varsayılan tarih aralığı:', {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const extractProductName = (message: string): string | null => {
    // "məhsulunun" kelimesinden önceki kelimeyi bul
    const match = message.match(/(\S+)\s+məhsulunun/i);
    if (match) {
      return match[1];
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <AIAssistantUI
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSend}
        provider={provider}
        onProviderChange={handleProviderChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },
  providerSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.text + '20',
  },
  providerButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.text + '20',
  },
  selectedProvider: {
    backgroundColor: PastryColors.primary,
    borderColor: PastryColors.primary,
  },
  providerText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedProviderText: {
    color: '#fff',
  },
}); 