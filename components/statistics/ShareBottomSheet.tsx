import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, useColorScheme as useNativeColorScheme, Animated, Dimensions, Platform, LayoutAnimation } from 'react-native';
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
                <Pressable
                    style={styles.backdropPressable}
                    onPress={handleClose}
                >
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

                    <View style={[styles.buttonGroup, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                        <TouchableOpacity
                            style={[styles.shareButton, styles.whatsappButton]}
                            onPress={() => {
                                onWhatsAppPress();
                                handleClose();
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={styles.buttonContent}>
                                <MaterialCommunityIcons name="whatsapp" size={20} color="#FFFFFF" />
                                <Text style={styles.buttonText}>WhatsApp</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.shareButton,
                                styles.outlineButton,
                                { backgroundColor: bgColor, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                            ]}
                            onPress={() => {
                                onExcelPress();
                                handleClose();
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={styles.buttonContent}>
                                <MaterialIcons name="table-chart" size={20} color={iconColor} />
                                <Text style={[styles.buttonText, { color: textColor }]}>Excel</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.shareButton,
                                styles.outlineButton,
                                { backgroundColor: bgColor, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                            ]}
                            onPress={() => {
                                onCopyPress();
                                handleClose();
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={styles.buttonContent}>
                                <MaterialIcons name="content-copy" size={20} color={iconColor} />
                                <Text style={[styles.buttonText, { color: textColor }]}>Kopyala</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: buttonBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                        onPress={handleClose}
                        activeOpacity={0.7}
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
    backdropPressable: {
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
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        borderTopWidth: 1,
        paddingTop: 24,
    },
    shareButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    whatsappButton: {
        backgroundColor: '#25D366',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    outlineButton: {
        borderWidth: 1,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
