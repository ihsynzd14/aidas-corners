import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBranches, fetchOrdersForDateRange } from '@/utils/firebase';
import { AIAssistantUI } from '@/components/ai-assistant/ui/AIAssistantUI';
import { DataProcessor } from '@/components/ai-assistant/core/DataProcessor';
import { AIPromptManager } from '@/components/ai-assistant/core/AIPromptManager';
import { Message, DateRange } from '@/components/ai-assistant/core/types';
import { Animated } from 'react-native';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

// Gemini API yapılandırması
const genAI = new GoogleGenerativeAI('AIzaSyBJc_JyLzf38h1QXtDOvjvEk2ZK6njVFoA');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export default function AiAssistant() {
  const initialMessage: Message = {
    role: 'assistant',
    content: 'Salam! Mən Aida\'s Corner\'in AI köməkçisiyəm. Sizə necə kömək edə bilərəm?\n\nBu mövzularda məlumat verə bilərəm:\n• Satış təhlili və proqnozlar\n• Anbar idarəetməsi və optimallaşdırma\n• Müştəri əlaqələri və marketinq təklifləri\n• Maliyyə hesabatları və proqnozlar\n• Logistika və təchizat zəncirinin optimallaşdırılması',
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
      const promptManager = AIPromptManager.getInstance();
      await promptManager.initializeBranches();
    };

    initAI();
  }, []);

  const handleSend = async (inputMessage: string) => {
    const userMessage: Message = { 
      role: 'user', 
      content: inputMessage,
      timestamp: new Date(),
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20)
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Kullanıcı mesajı için giriş animasyonu
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
      const branches = await getBranches();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const ordersMap = await fetchOrdersForDateRange(startDate, endDate);
      
      // Siparişleri işlenebilir formata dönüştür
      const orders: Record<string, Record<string, any>> = {};
      for (const [date, snapshot] of ordersMap.entries()) {
        const branchOrders: Record<string, any> = {};
        snapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          branchOrders[doc.id] = doc.data();
        });
        orders[date] = branchOrders;
      }

      // Veri işleme
      const dataProcessor = DataProcessor.getInstance();
      const { salesData, productGroups } = dataProcessor.processOrders(orders);

      // Tarih aralığını hazırla
      const dateRange: DateRange = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      // Prompt oluşturma
      const promptManager = AIPromptManager.getInstance();
      const context = promptManager.createContext(
        salesData, 
        productGroups, 
        promptManager.getBranchGroups()
      );
      const prompt = promptManager.createPrompt(context, inputMessage, dateRange);

      // AI yanıtı al
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Yanıtı kontrol et
      if (!text || text === 'undefined') {
        throw new Error('AI yanıtı boş veya geçersiz');
      }

      // Yanıtı doğrula
      const isValid = promptManager.validateResponse(text, salesData, dateRange);
      if (!isValid) {
        throw new Error('AI yanıtı doğrulama kontrolünden geçemedi');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: text.trim(), // Boşlukları temizle
        timestamp: new Date(),
        isTyping: true,
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(20)
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Asistan mesajı için giriş animasyonu
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
      console.error('Hata:', error);
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

  return (
    <AIAssistantUI
      messages={messages}
      isLoading={isLoading}
      onSendMessage={handleSend}
    />
  );
} 