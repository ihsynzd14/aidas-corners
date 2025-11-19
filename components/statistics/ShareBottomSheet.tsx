import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, useColorScheme as useNativeColorScheme, Animated, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { colorScheme } from '@/constants/colorScheme';

interface ShareBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onExcelPress: () => void;
    onWhatsAppPress: () => void;
    onCopyPress: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ShareBottomSheet: React.FC<ShareBottomSheetProps> = ({
    visible,
    onClose,
    onExcelPress,
    onWhatsAppPress,
    onCopyPress,
}) => {
    const nativeColorScheme = useNativeColorScheme();
    const isDark = nativeColorScheme === 'dark';

    // Animation values
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [showModal, setShowModal] = useState(visible);

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start(() => setShowModal(false));
        }
    }, [visible]);

    const handleClose = () => {
        onClose();
    };

    const bgColor = isDark ? colorScheme.cardDark : colorScheme.cardLight;
    const textColor = isDark ? colorScheme.textDark : colorScheme.textLight;
    const iconColor = isDark ? colorScheme.textDark : colorScheme.textLight;
    const overlayColor = isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)';
    const buttonBg = isDark ? '#374151' : '#F3F4F6';

    if (!showModal) return null;

    return (
        <Modal
            visible={showModal}
            transparent
            animationType="none"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
                    <Animated.View
                        style={[
                            styles.backdrop,
                            {
                                backgroundColor: 'black',
                                opacity: fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 0.5]
                                })
                            }
                        ]}
                    />
                </Pressable>

                <Animated.View
                    style={[
                        styles.contentContainer,
                        {
                            backgroundColor: bgColor,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.handleContainer}>
                        <View style={[styles.handle, { backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]} />
                    </View>

                    <Text style={[styles.title, { color: textColor }]}>Paylaş</Text>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            style={[styles.option, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}
                            onPress={() => {
                                onExcelPress();
                                handleClose();
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#E6F4EA' }]}>
                                <MaterialIcons name="table-chart" size={32} color="#10B981" />
                            </View>
                            <Text style={[styles.optionText, { color: textColor }]}>Excel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.option, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}
                            onPress={() => {
                                onWhatsAppPress();
                                handleClose();
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#E0F2F1' }]}>
                                <MaterialCommunityIcons name="whatsapp" size={32} color="#25D366" />
                            </View>
                            <Text style={[styles.optionText, { color: textColor }]}>WhatsApp</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.option, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}
                            onPress={() => {
                                onCopyPress();
                                handleClose();
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: buttonBg }]}>
                                <MaterialIcons name="content-copy" size={32} color={iconColor} />
                            </View>
                            <Text style={[styles.optionText, { color: textColor }]}>Kopyala</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: buttonBg }]}
                        onPress={handleClose}
                    >
                        <Text style={[styles.cancelText, { color: textColor }]}>Ləğv et</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    handleContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    handle: {
        width: 48,
        height: 5,
        borderRadius: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 32,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        paddingHorizontal: 12,
    },
    option: {
        alignItems: 'center',
        gap: 12,
        width: '30%',
        paddingVertical: 16,
        borderRadius: 16,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    cancelButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
