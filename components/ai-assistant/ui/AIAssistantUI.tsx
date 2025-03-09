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
  Clipboard,
  Modal,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, PastryColors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Message, AIProvider } from '../core/types';
import { TopBar } from '@/components/TopBar';

interface Props {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  provider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

const TypeWriter = ({ text, onComplete, style }: { text: string; onComplete?: () => void; style?: any }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const textRef = useRef(text);
  const chunkSize = 5; // Her adımda eklenecek karakter sayısı
  
  useEffect(() => {
    // Yeni metin geldiğinde referansı güncelle
    textRef.current = text;
    
    // Animasyonu sıfırla
    setDisplayedText('');
    setIsComplete(false);
    
    // Önceki timeout'u temizle
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Metin boşsa hemen tamamlandı say
    if (!text) {
      setIsComplete(true);
      onComplete?.();
      return;
    }
    
    // Animasyonu başlat
    const animateText = (currentLength = 0) => {
      if (currentLength >= text.length) {
        setIsComplete(true);
        onComplete?.();
        return;
      }
      
      // Bir sonraki chunk'ı hesapla
      const nextLength = Math.min(currentLength + chunkSize, text.length);
      
      // Metni güncelle
      setDisplayedText(text.substring(0, nextLength));
      
      // Bir sonraki adımı planla
      timeoutRef.current = setTimeout(() => {
        animateText(nextLength);
      }, 10);
    };
    
    // Animasyonu başlat
    animateText();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, onComplete]);
  
  // Metin tamamlandıysa veya komponent unmount olacaksa tam metni göster
  if (isComplete) {
    return <Text style={style}>{textRef.current}</Text>;
  }
  
  return <Text style={style}>{displayedText}</Text>;
};

const AIProviderSelector = ({ visible, onClose, currentProvider, onSelect }: {
  visible: boolean;
  onClose: () => void;
  currentProvider: AIProvider;
  onSelect: (provider: AIProvider) => void;
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const providers: { id: AIProvider; name: string; icon: string }[] = [
    { id: 'groq', name: 'Groq AI', icon: 'memory' },
    { id: 'gemini', name: 'Gemini Flash 2 Pro', icon: 'auto-awesome' },
    { id: 'openrouter', name: 'DeepSeek R1', icon: 'router' }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.providerMenu, { backgroundColor: theme.background }]}>
          {providers.map(provider => (
            <TouchableOpacity
              key={provider.id}
              style={[
                styles.providerMenuItem,
                currentProvider === provider.id && styles.selectedProviderMenuItem
              ]}
              onPress={() => {
                onSelect(provider.id);
                onClose();
              }}
            >
              <MaterialIcons
                name={provider.icon as any}
                size={24}
                color={currentProvider === provider.id ? '#fff' : theme.text}
              />
              <Text
                style={[
                  styles.providerMenuText,
                  { color: currentProvider === provider.id ? '#fff' : theme.text }
                ]}
              >
                {provider.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const HelpModal = ({ visible, onClose, onSelectQuestion }: { 
  visible: boolean; 
  onClose: () => void;
  onSelectQuestion: (question: string) => void;
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const aiProviders = [
    {
      id: 'groq',
      title: 'Groq AI',
      icon: 'memory',
      description: 'Ən sürətli və dəqiq cavablar üçün',
      features: [
        'Çox sürətli cavab müddəti',
        'Mürəkkəb analitik sorğular üçün optimal',
        'Dəqiq rəqəmsal hesablamalar',
        'Yüksək kontekst anlama qabiliyyəti'
      ],
      bestFor: 'Satış təhlili və statistik hesabatlar üçün ən yaxşı seçim'
    },
    {
      id: 'gemini',
      title: 'Gemini Flash 2 Pro',
      icon: 'auto-awesome',
      description: 'Yaradıcı və geniş təhlil tələb edən sorğular üçün',
      features: [
        'Geniş kontekst pəncərəsi',
        'Yaradıcı təhlil qabiliyyəti',
        'Çoxlu məlumatın müqayisəsi',
        'Trend analizi və proqnozlaşdırma'
      ],
      bestFor: 'Müqayisəli təhlillər və trend analizi üçün optimal'
    },
    {
      id: 'deepseek',
      title: 'DeepSeek R1',
      icon: 'router',
      description: 'Balanslaşdırılmış performans və dəqiqlik',
      features: [
        'Yüksək dəqiqlik',
        'Orta sürət',
        'Yaxşı kontekst anlama',
        'Effektiv resurs istifadəsi'
      ],
      bestFor: 'Ümumi sorğular və gündəlik istifadə üçün'
    }
  ];

  const examples = [
    {
      title: 'Sadə Suallar',
      description: 'Tək bir məlumat tələb edən sadə sorğular',
      goodExample: {
        question: '01.02.2024 - 28.02.2024 tarixləri arasında Next Crescent filialında Tiramisu satışı nə qədərdir?',
        explanation: '✓ Tarix aralığı, filial adı və məhsul adı dəqiq göstərilib\n✓ Tək bir məlumat soruşulur\n✓ "nə qədərdir" ifadəsi ilə rəqəmsal məlumat tələb edilir'
      },
      badExample: {
        question: 'Tiramisu satışı necədir?',
        explanation: '✗ Tarix aralığı yoxdur\n✗ Hansı filial olduğu bilinmir\n✗ "necədir" sözü qeyri-müəyyəndir'
      },
      questions: [
        'Neçə filial (branch) var?',
        'Next Mərkəz filialında hansı desert növləri satılır?',
        'Next Crescent filialında Tiramisu satışı nə qədərdir?'
      ]
    },
    {
      title: 'Orta Səviyyəli Suallar',
      description: 'Bir neçə məlumatın müqayisəsini tələb edən sorğular',
      goodExample: {
        question: '01.02.2024 - 28.02.2024 tarixləri arasında San Sebastian tortunun bütün filiallardakı ümumi satış miqdarı nə qədərdir?',
        explanation: '✓ Tarix aralığı dəqiq göstərilib\n✓ Məhsul adı tam yazılıb\n✓ "ümumi satış miqdarı" ilə nəyin hesablanacağı aydındır'
      },
      badExample: {
        question: 'Tortların satışını müqayisə edin',
        explanation: '✗ Hansı tortlar olduğu bilinmir\n✗ Tarix aralığı yoxdur\n✗ Müqayisə meyarları qeyri-müəyyəndir'
      },
      questions: [
        'Hansı filialda ən çox məhsul çeşidi var və neçə çeşiddir?',
        'San Sebastian bütün filiallardakı ümumi satış miqdarı nə qədərdir?',
        'Profiterol satışı edən filialları və miqdarlarını sadalayın.'
      ]
    },
    {
      title: 'Çətin Suallar',
      description: 'Kompleks təhlil və müqayisə tələb edən sorğular',
      goodExample: {
        question: '01.02.2024 - 28.02.2024 tarixləri arasında Next və Coffemania filiallarının məhsul çeşidlərini və satış həcmlərini müqayisə edin.',
        explanation: '✓ Tarix aralığı dəqiq göstərilib\n✓ Müqayisə ediləcək qruplar aydındır\n✓ Müqayisə meyarları (çeşid və həcm) dəqiq göstərilib'
      },
      badExample: {
        question: 'Ən yaxşı filialı tapın',
        explanation: '✗ "Ən yaxşı" meyarı qeyri-müəyyəndir\n✗ Tarix aralığı yoxdur\n✗ Hansı göstəricilərə görə müqayisə ediləcəyi bilinmir'
      },
      questions: [
        'Ən yüksək satış miqdarına malik olan 3 məhsulu və miqdarlarını tapın.',
        'Next brendinə aid filialların və Coffemania brendinə aid filialların məhsul çeşidlərini müqayisə edin.',
        'Hər filialın ən çox və ən az satılan məhsulunu və miqdarlarını tapın.',
        'Bütün filiallarda ortaq olan məhsulları müəyyən edin və satış miqdarlarını müqayisə edin.'
      ]
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={[styles.modalOverlay]}>
        <Animated.View style={[styles.helpModalContent, { 
          backgroundColor: theme.background,
          transform: [{ 
            translateY: useRef(new Animated.Value(0)).current
          }]
        }]}>
          <View style={styles.modalHandle} />
          
          <View style={styles.helpModalHeader}>
            <Text style={[styles.helpModalTitle, { color: theme.text }]}>Sual Nümunələri</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.helpModalScroll} showsVerticalScrollIndicator={false}>
      {/* Questions Section */}
      {examples.map((category, index) => (
              <View key={index} style={styles.categoryContainer}>
                <TouchableOpacity 
                  style={[
                    styles.categoryHeader,
                    selectedCategory === category.title && styles.selectedCategoryHeader
                  ]}
                  onPress={() => setSelectedCategory(
                    selectedCategory === category.title ? null : category.title
                  )}
                >
                  <Text style={[
                    styles.categoryTitle, 
                    { color: selectedCategory === category.title ? '#fff' : PastryColors.primary }
                  ]}>
                    {category.title}
                  </Text>
                  <MaterialIcons 
                    name={selectedCategory === category.title ? 'expand-less' : 'expand-more'} 
                    size={24} 
                    color={selectedCategory === category.title ? '#fff' : PastryColors.primary} 
                  />
                </TouchableOpacity>

                {selectedCategory === category.title && (
                  <View style={styles.categoryContent}>
                    <Text style={[styles.categoryDescription, { color: theme.text }]}>
                      {category.description}
                    </Text>

                    <View style={styles.exampleContainer}>
                      <View style={[styles.goodExampleBox, { 
                        borderColor: '#4CAF50',
                        backgroundColor: '#4CAF5010',
                      }]}>
                        <Text style={[styles.exampleTitle, { color: '#4CAF50' }]}>Düzgün Sual:</Text>
                        <Text style={[styles.exampleText, { color: theme.text }]}>
                          {category.goodExample.question}
                        </Text>
                        <Text style={[styles.exampleExplanation, { color: '#4CAF50' }]}>
                          {category.goodExample.explanation}
                        </Text>
                      </View>

                      <View style={[styles.badExampleBox, { 
                        borderColor: '#F44336',
                        backgroundColor: '#F4433610',
                      }]}>
                        <Text style={[styles.exampleTitle, { color: '#F44336' }]}>Səhv Sual:</Text>
                        <Text style={[styles.exampleText, { color: theme.text }]}>
                          {category.badExample.question}
                        </Text>
                        <Text style={[styles.exampleExplanation, { color: '#F44336' }]}>
                          {category.badExample.explanation}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.questionsTitle, { color: PastryColors.primary }]}>
                      Nümunə Suallar:
                    </Text>
                    {category.questions.map((question, qIndex) => (
                      <TouchableOpacity 
                        key={qIndex}
                        style={[styles.questionButton, { backgroundColor: PastryColors.primary + '10' }]}
                        onPress={() => {
                          onSelectQuestion(question);
                          onClose();
                        }}
                      >
                        <Text style={[styles.questionText, { color: theme.text }]}>
                          {question}
                        </Text>
                        <MaterialIcons name="content-copy" size={20} color={PastryColors.primary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}

            <View style={styles.divider} />

            {/* AI Providers Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                AI Növləri
              </Text>
              <Text style={[styles.sectionDescription, { color: theme.text + '99' }]}>
                Hər bir AI növünün öz güclü tərəfləri var. Sualınızın tipinə görə ən uyğun olanı seçin:
              </Text>
              
              {aiProviders.map((provider) => (
                <View key={provider.id} style={styles.providerContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.providerHeader,
                      selectedProvider === provider.id && styles.selectedProviderHeader
                    ]}
                    onPress={() => setSelectedProvider(
                      selectedProvider === provider.id ? null : provider.id
                    )}
                  >
                    <View style={styles.providerHeaderLeft}>
                      <MaterialIcons 
                        name={provider.icon as any} 
                        size={24} 
                        color={selectedProvider === provider.id ? '#fff' : PastryColors.primary} 
                      />
                      <Text style={[
                        styles.providerTitle, 
                        { color: selectedProvider === provider.id ? '#fff' : theme.text }
                      ]}>
                        {provider.title}
                      </Text>
                    </View>
                    <MaterialIcons 
                      name={selectedProvider === provider.id ? 'expand-less' : 'expand-more'} 
                      size={24} 
                      color={selectedProvider === provider.id ? '#fff' : theme.text} 
                    />
                  </TouchableOpacity>
                  
                  {selectedProvider === provider.id && (
                    <View style={[styles.providerContent, { backgroundColor: theme.background }]}>
                      <Text style={[styles.providerDescription, { color: theme.text + '99' }]}>
                        {provider.description}
                      </Text>
                      
                      <View style={styles.featuresList}>
                        {provider.features.map((feature, fIndex) => (
                          <View key={fIndex} style={styles.featureItem}>
                            <MaterialIcons name="check-circle" size={16} color={PastryColors.primary} />
                            <Text style={[styles.featureText, { color: theme.text }]}>
                              {feature}
                            </Text>
                          </View>
                        ))}
                      </View>
                      
                      <Text style={[styles.bestForText, { color: PastryColors.primary }]}>
                        {provider.bestFor}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
      
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export const AIAssistantUI: React.FC<Props> = ({
  messages,
  isLoading,
  onSendMessage,
  provider,
  onProviderChange
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleSelectQuestion = (question: string) => {
    setInputMessage(question);
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
      <TopBar 
        title="AI Köməkçi (Beta)" 
        style={styles.topBar}
        rightComponent={
          <TouchableOpacity onPress={() => setShowHelpModal(true)} style={styles.helpButton}>
            <MaterialIcons name="help-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        }
      />
      
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
          <TouchableOpacity
            style={styles.providerButton}
            onPress={() => setShowProviderMenu(true)}
          >
            <MaterialIcons
              name={
                provider === 'groq' ? 'memory' :
                provider === 'gemini' ? 'auto-awesome' : 'router'
              }
              size={24}
              color={PastryColors.primary}
            />
          </TouchableOpacity>
          <TextInput
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Sualınızı yazın..."
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

      <AIProviderSelector
        visible={showProviderMenu}
        onClose={() => setShowProviderMenu(false)}
        currentProvider={provider}
        onSelect={onProviderChange}
      />

      <HelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        onSelectQuestion={handleSelectQuestion}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
   
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
  providerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.text + '20',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  providerMenu: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  providerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedProviderMenuItem: {
    backgroundColor: PastryColors.primary,
  },
  providerMenuText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  helpButton: {
    padding: 8,
  },
  helpModalContent: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  helpModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  helpModalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  helpModalScroll: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.text + '20',
    borderRadius: 8,
  },
  selectedCategoryHeader: {
    backgroundColor: PastryColors.primary,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  categoryContent: {
    padding: 12,
  },
  categoryDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  exampleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goodExampleBox: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  badExampleBox: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  exampleExplanation: {
    fontSize: 12,
    lineHeight: 18,
  },
  questionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  questionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.light.text + '20',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  providerContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.text + '20',
    borderRadius: 8,
  },
  selectedProviderHeader: {
    backgroundColor: PastryColors.primary,
    borderColor: PastryColors.primary,
  },
  providerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  providerContent: {
    padding: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.light.text + '20',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  providerDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 16,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bestForText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.text + '20',
    marginVertical: 24,
  },
}); 