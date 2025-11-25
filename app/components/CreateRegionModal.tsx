import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, Animated } from 'react-native';
import { colorScheme } from '@/constants/colorScheme';
import { useState, useEffect, useRef } from 'react';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface CreateRegionModalProps {
    visible: boolean;
    isDarkMode: boolean;
    regionName: string;
    setRegionName: (name: string) => void;
    searchText: string;
    setSearchText: (text: string) => void;
    selectedProducts: string[];
    filteredProducts: string[];
    onToggleProduct: (product: string) => void;
    onSave: () => void;
    onClose: () => void;
}

export default function CreateRegionModal({
    visible,
    isDarkMode,
    regionName,
    setRegionName,
    searchText,
    setSearchText,
    selectedProducts,
    filteredProducts,
    onToggleProduct,
    onSave,
    onClose,
}: CreateRegionModalProps) {
    const [focusedInput, setFocusedInput] = useState<'name' | 'search' | null>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        }
    }, [visible]);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const isValid = regionName.trim() && selectedProducts.length > 0;
    const progress = (selectedProducts.length / filteredProducts.length) * 100;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: isDarkMode ? '#0a0608' : '#fefbfc',
            }}>
                {/* Gradient Header */}
                <View style={{
                    position: 'relative',
                    overflow: 'hidden',
                }}>

                    <View style={{
                        paddingHorizontal: 24,
                        paddingTop: 20,
                        paddingBottom: 24,
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 20,
                        }}>
                            <TouchableOpacity
                                onPress={onClose}
                                activeOpacity={0.7}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                                }}
                            >
                                <IconSymbol
                                    name="chevron.left"
                                    size={20}
                                    color={isDarkMode ? '#f0e6e8' : '#3d2328'}
                                />
                            </TouchableOpacity>

                            <View style={{ alignItems: 'center', flex: 1, marginHorizontal: 16 }}>
                                <Text style={{
                                    fontSize: 22,
                                    fontWeight: '800',
                                    color: isDarkMode ? '#f8f6f6' : '#1b0e10',
                                    letterSpacing: -0.8,
                                }}>
                                    Yeni Bölgə ✨
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={onSave}
                                disabled={!isValid}
                                activeOpacity={0.8}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    backgroundColor: !isValid
                                        ? (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')
                                        : '#5d9c59',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    shadowColor: isValid ? '#5d9c59' : 'transparent',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: isValid ? 8 : 0,
                                }}
                            >
                                <Text style={{
                                    fontSize: 20,
                                    color: !isValid
                                        ? (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')
                                        : '#FFFFFF',
                                    fontWeight: '600',
                                }}>✓</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedProducts.length > 0 && (
                            <View style={{
                                marginTop: 12,
                                paddingHorizontal: 4,
                            }}>
                                <View style={{
                                    height: 4,
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                }}>
                                    <Animated.View style={{
                                        height: '100%',
                                        width: `${Math.min(progress, 100)}%`,
                                        backgroundColor: '#5d9c59',
                                        borderRadius: 2,
                                    }} />
                                </View>
                                <Text style={{
                                    fontSize: 10,
                                    fontWeight: '600',
                                    color: isDarkMode ? 'rgba(248,246,246,0.4)' : 'rgba(27,14,16,0.4)',
                                    marginTop: 6,
                                    letterSpacing: 0.5,
                                }}>
                                    {selectedProducts.length} / {filteredProducts.length} məhsul seçildi
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    <View style={{ paddingHorizontal: 24 }}>
                        {/* Region Name Input */}
                        <Animated.View style={{
                            marginBottom: 24,
                            transform: [{
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0],
                                })
                            }],
                            opacity: slideAnim,
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 12,
                                gap: 8,
                            }}>
                                <View style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: '#5d9c59',
                                }} />
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: '700',
                                    color: isDarkMode ? '#f8f6f6' : '#1b0e10',
                                    letterSpacing: 0.5,
                                }}>
                                    Bölgə Adı
                                </Text>
                                <Text style={{
                                    fontSize: 11,
                                    color: isDarkMode ? 'rgba(248,246,246,0.4)' : 'rgba(27,14,16,0.4)',
                                    fontStyle: 'italic',
                                }}>
                                    (tələb olunur)
                                </Text>
                            </View>

                            <View style={{ position: 'relative' }}>
                                <TextInput
                                    value={regionName}
                                    onChangeText={setRegionName}
                                    onFocus={() => setFocusedInput('name')}
                                    onBlur={() => setFocusedInput(null)}
                                    placeholder="✏️  Məsələn: Cheesecake Komandası"
                                    placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                                    style={{
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
                                        borderRadius: 16,
                                        borderWidth: 2,
                                        borderColor: focusedInput === 'name'
                                            ? '#5d9c59'
                                            : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                                        paddingHorizontal: 20,
                                        paddingVertical: 18,
                                        fontSize: 16,
                                        fontWeight: '600',
                                        color: isDarkMode ? '#f8f6f6' : '#1b0e10',
                                        shadowColor: focusedInput === 'name' ? '#5d9c59' : '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: focusedInput === 'name' ? 0.15 : 0.05,
                                        shadowRadius: 12,
                                        elevation: focusedInput === 'name' ? 6 : 2,
                                    }}
                                />
                                {regionName.length > 0 && (
                                    <View style={{
                                        position: 'absolute',
                                        right: 16,
                                        top: '50%',
                                        marginTop: -10,
                                        width: 20,
                                        height: 20,
                                        borderRadius: 10,
                                        backgroundColor: '#5d9c59',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                                    </View>
                                )}
                            </View>
                        </Animated.View>

                        {/* Products Section */}
                        <View style={{ marginBottom: 32 }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 16,
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={{ fontSize: 20 }}>🎯</Text>
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: '700',
                                        color: isDarkMode ? '#f8f6f6' : '#1b0e10',
                                        letterSpacing: 0.5,
                                    }}>
                                        Məhsulları Seç
                                    </Text>
                                </View>

                                <View style={{
                                    backgroundColor: selectedProducts.length > 0
                                        ? 'rgba(93, 156, 89, 0.15)'
                                        : (isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                                    paddingHorizontal: 14,
                                    paddingVertical: 7,
                                    borderRadius: 20,
                                    borderWidth: 1.5,
                                    borderColor: selectedProducts.length > 0
                                        ? 'rgba(93, 156, 89, 0.3)'
                                        : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                                }}>
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: '700',
                                        color: selectedProducts.length > 0 ? '#5d9c59' : (isDarkMode ? '#f8f6f6' : '#1b0e10'),
                                        letterSpacing: 0.5,
                                    }}>
                                        {selectedProducts.length}
                                    </Text>
                                </View>
                            </View>

                            {/* Search Input */}
                            <View style={{ position: 'relative', marginBottom: 12 }}>
                                <TextInput
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    onFocus={() => setFocusedInput('search')}
                                    onBlur={() => setFocusedInput(null)}
                                    placeholder="🔎  Məhsul axtar..."
                                    placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                                    style={{
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
                                        borderRadius: 14,
                                        borderWidth: 2,
                                        borderColor: focusedInput === 'search'
                                            ? '#5d9c59'
                                            : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        fontSize: 14,
                                        fontWeight: '600',
                                        color: isDarkMode ? '#f8f6f6' : '#1b0e10',
                                        shadowColor: focusedInput === 'search' ? '#5d9c59' : '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: focusedInput === 'search' ? 0.15 : 0.05,
                                        shadowRadius: 8,
                                        elevation: focusedInput === 'search' ? 4 : 2,
                                    }}
                                />
                                {searchText.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setSearchText('')}
                                        style={{
                                            position: 'absolute',
                                            right: 12,
                                            top: '50%',
                                            marginTop: -12,
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontSize: 12, color: isDarkMode ? '#f8f6f6' : '#1b0e10', fontWeight: '600' }}>×</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {searchText.length > 0 && (
                                <Text style={{
                                    fontSize: 11,
                                    color: isDarkMode ? 'rgba(248,246,246,0.5)' : 'rgba(27,14,16,0.5)',
                                    paddingHorizontal: 4,
                                    marginBottom: 12,
                                    fontWeight: '500',
                                }}>
                                    {filteredProducts.length} məhsul tapıldı
                                </Text>
                            )}

                            {/* Products Grid */}
                            <View style={{
                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
                                borderRadius: 20,
                                borderWidth: 1.5,
                                borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                padding: 12,
                                maxHeight: 400,
                            }}>
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    nestedScrollEnabled={true}
                                >
                                    <View style={{
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                        gap: 8,
                                        justifyContent: 'space-between',
                                    }}>
                                        {filteredProducts.map((item) => {
                                            const isSelected = selectedProducts.includes(item);
                                            return (
                                                <TouchableOpacity
                                                    key={item}
                                                    onPress={() => onToggleProduct(item)}
                                                    activeOpacity={0.7}
                                                    style={{
                                                        backgroundColor: isDarkMode ? colorScheme.cardDark : colorScheme.cardLight,
                                                        borderRadius: 12,
                                                        borderWidth: 2,
                                                        borderColor: isSelected
                                                            ? '#5d9c59'
                                                            : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 8,
                                                        width: '48%', // Spread items across 2 columns
                                                        maxWidth: 180,
                                                        alignItems: 'center',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 2 },
                                                        shadowOpacity: 0.08,
                                                        shadowRadius: 4,
                                                        elevation: 2,
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        width: '100%',
                                                        justifyContent: 'flex-start',
                                                    }}>
                                                        <View style={{
                                                            width: 18,
                                                            height: 18,
                                                            borderRadius: 9,
                                                            backgroundColor: isSelected
                                                                ? '#5d9c59'
                                                                : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                        }}>
                                                            {isSelected ? (
                                                                <Text style={{ fontSize: 9, color: '#ffffff', fontWeight: 'bold' }}>✓</Text>
                                                            ) : (
                                                                <Text style={{ fontSize: 11 }}>📦</Text>
                                                            )}
                                                        </View>
                                                        
                                                        <Text style={{
                                                            fontSize: 12,
                                                            fontWeight: '600',
                                                            color: isDarkMode ? colorScheme.textDark : colorScheme.textLight,
                                                            flex: 1,
                                                            textAlign: 'left',
                                                        }} numberOfLines={1}>
                                                            {item}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </ScrollView>
                            </View>
                        </View>

                        {/* Selected Products Summary */}
                        {selectedProducts.length > 0 && (
                            <Animated.View style={{ marginBottom: 20 }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 16,
                                    paddingHorizontal: 4,
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <View style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 16,
                                            backgroundColor: isDarkMode ? 'rgba(93, 156, 89, 0.2)' : 'rgba(93, 156, 89, 0.15)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Text style={{ fontSize: 16 }}>✨</Text>
                                        </View>
                                        <View>
                                            <Text style={{
                                                fontSize: 15,
                                                fontWeight: '800',
                                                color: isDarkMode ? '#f8f6f6' : '#1b0e10',
                                                letterSpacing: 0.3,
                                            }}>
                                                Seçilmiş Məhsullar
                                            </Text>
                                            <Text style={{
                                                fontSize: 11,
                                                fontWeight: '500',
                                                color: isDarkMode ? 'rgba(248,246,246,0.5)' : 'rgba(27,14,16,0.5)',
                                                marginTop: 2,
                                            }}>
                                                Siyahınız hazırdır • Toxunun silin
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{
                                        backgroundColor: '#5d9c59',
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 14,
                                        shadowColor: '#5d9c59',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}>
                                        <Text style={{
                                            color: '#ffffff',
                                            fontSize: 13,
                                            fontWeight: '800',
                                            letterSpacing: 0.5,
                                        }}>
                                            {selectedProducts.length}
                                        </Text>
                                    </View>
                                </View>

                                <View style={{
                                    backgroundColor: 'transparent',
                                    borderRadius: 18,
                                    padding: 14,
                                    gap: 10,
                                }}>
                                    {selectedProducts.map((product, index) => (
                                        <TouchableOpacity
                                            key={product}
                                            onPress={() => onToggleProduct(product)}
                                            activeOpacity={0.7}
                                            style={{
                                                backgroundColor: 'transparent',
                                                borderRadius: 12,
                                                borderWidth: 1.5,
                                                borderColor: isDarkMode ? 'rgba(93, 156, 89, 0.25)' : 'rgba(93, 156, 89, 0.2)',
                                                paddingHorizontal: 16,
                                                paddingVertical: 12,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 12,
                                            }}
                                        >
                                            <View style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 14,
                                                backgroundColor: '#5d9c59',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Text style={{
                                                    fontSize: 12,
                                                    fontWeight: '800',
                                                    color: '#ffffff',
                                                }}>
                                                    {index + 1}
                                                </Text>
                                            </View>

                                            <View style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: 12,
                                                backgroundColor: isDarkMode ? 'rgba(93, 156, 89, 0.15)' : 'rgba(93, 156, 89, 0.1)',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Text style={{ fontSize: 14 }}>📦</Text>
                                            </View>

                                            <Text style={{
                                                flex: 1,
                                                fontSize: 14,
                                                fontWeight: '700',
                                                color: isDarkMode ? '#f8f6f6' : '#1b0e10',
                                                letterSpacing: 0.2,
                                            }}>
                                                {product}
                                            </Text>

                                            <View style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 14,
                                                backgroundColor: isDarkMode ? 'rgba(255, 89, 89, 0.15)' : 'rgba(255, 59, 48, 0.1)',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderWidth: 1,
                                                borderColor: isDarkMode ? 'rgba(255, 89, 89, 0.3)' : 'rgba(255, 59, 48, 0.2)',
                                            }}>
                                                <Text style={{
                                                    fontSize: 16,
                                                    color: isDarkMode ? '#ff5959' : '#ff3b30',
                                                    fontWeight: '600',
                                                    lineHeight: 16,
                                                }}>🗑️</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </Animated.View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}
