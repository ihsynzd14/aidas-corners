import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Animated,
  StyleSheet,
  Clipboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, PastryColors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Message } from '../core/types';
import { TopBar } from '@/components/TopBar';

interface Props {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const TypeWriter = ({ text, onComplete, style }: { text: string; onComplete?: () => void; style?: any }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    setIsComplete(false);
    
    // Önceki interval'i temizle
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Metin boşsa hemen tamamlandı say
    if (!text) {
      setIsComplete(true);
      onComplete?.();
      return;
    }
    
    // Yeni interval oluştur
    intervalRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => {
          // Unicode karakterleri doğru şekilde işle
          const nextChar = text.charAt(index);
          return prev + nextChar;
        });
        index++;
      } else {
        clearInterval(intervalRef.current);
        setIsComplete(true);
        onComplete?.();
      }
    }, 10); // Hızı biraz artırdık
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text]);
  
  // Metin tamamlandıysa normal Text komponenti kullan
  if (isComplete) {
    return <Text style={style}>{text}</Text>;
  }
  
  return <Text style={style}>{displayedText}</Text>;
};

export const AIAssistantUI: React.FC<Props> = ({ messages, isLoading, onSendMessage }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const copyToClipboard = async (content: string) => {
    await Clipboard.setString(content);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('az-AZ', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar title="AI Köməkçi (Beta)" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 120 }
          ]}
        >
          {messages.map((message, index) => (
            <Animated.View
              key={index}
              style={[
                styles.messageContainer,
                {
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  opacity: message.opacity,
                  transform: [{ translateY: message.translateY || 0 }]
                }
              ]}
            >
              {message.role === 'assistant' && (
                <View style={[styles.avatarContainer, { backgroundColor: PastryColors.primary + '20' }]}>
                  <MaterialIcons name="smart-toy" size={20} color={PastryColors.primary} />
                </View>
              )}
              
              <View style={[
                styles.messageBubble,
                {
                  backgroundColor: message.role === 'user' ? PastryColors.primary : theme.background,
                  borderWidth: message.role === 'assistant' ? 1 : 0,
                  borderColor: theme.text + '20',
                  marginLeft: message.role === 'user' ? 50 : 0,
                  marginRight: message.role === 'assistant' ? 50 : 0,
                }
              ]}>
                {message.isTyping ? (
                  <TypeWriter 
                    text={message.content}
                    style={[
                      styles.messageText,
                      { color: message.role === 'user' ? '#fff' : theme.text }
                    ]}
                    onComplete={() => {
                      message.isTyping = false;
                    }}
                  />
                ) : (
                  <Text style={[
                    styles.messageText,
                    { color: message.role === 'user' ? '#fff' : theme.text }
                  ]}>
                    {message.content}
                  </Text>
                )}
                <View style={styles.messageFooter}>
                  <Text style={[
                    styles.timeText,
                    {
                      color: message.role === 'user' ? '#fff' : theme.text + '80',
                      textAlign: message.role === 'user' ? 'right' : 'left',
                    }
                  ]}>
                    {formatTime(message.timestamp)}
                  </Text>
                  {message.role === 'assistant' && (
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(message.content)}
                      style={styles.copyButton}
                    >
                      <MaterialIcons 
                        name="content-copy" 
                        size={16} 
                        color={theme.text + '80'} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Animated.View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={PastryColors.primary} style={styles.loadingIndicator} />
              <Text style={[styles.loadingText, { color: theme.text + '80' }]}>
                Cavab yazılır...
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={[
          styles.inputContainer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.text + '10',
            paddingBottom: Math.max(insets.bottom + 65, 16)
          }
        ]}>
          <TextInput
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={theme.text + '80'}
            multiline
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.text + '20',
                color: theme.text,
              }
            ]}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputMessage.trim() || isLoading}
            style={[
              styles.sendButton,
              {
                backgroundColor: PastryColors.primary,
                opacity: !inputMessage.trim() || isLoading ? 0.5 : 1,
              }
            ]}
          >
            <MaterialIcons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    borderTopRightRadius: 4,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
  },
  copyButton: {
    padding: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 40,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
}); 