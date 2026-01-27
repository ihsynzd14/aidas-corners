import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Modal,
    View,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    useColorScheme,
    Animated,
    PanResponder,
    Alert,
    ActivityIndicator,
    Text
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface YearRangePickerProps {
    visible: boolean;
    onClose: () => void;
    onGenerate: (startYear: number, endYear: number) => Promise<void>;
}

export const YearRangePicker: React.FC<YearRangePickerProps> = ({
    visible,
    onClose,
    onGenerate,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const currentYear = new Date().getFullYear();
    const [startYear, setStartYear] = useState(currentYear.toString());
    const [endYear, setEndYear] = useState((currentYear + 1).toString());
    const [loading, setLoading] = useState(false);

    // Animation values
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            setStartYear(currentYear.toString());
            setEndYear((currentYear + 1).toString());
            setLoading(false);

            slideAnim.setValue(SCREEN_HEIGHT);
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.9);

            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }),
            ]).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const handleGenerate = async () => {
        const start = parseInt(startYear);
        const end = parseInt(endYear);

        if (isNaN(start) || isNaN(end)) {
            Alert.alert('Xəta', 'Zəhmət olmasa düzgün il daxil edin.');
            return;
        }

        if (start > end) {
            Alert.alert('Xəta', 'Başlanğıc il bitiş ilindən böyük ola bilməz.');
            return;
        }

        setLoading(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            await onGenerate(start, end);
            handleClose();
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            console.error(error);
            Alert.alert('Xəta', 'Hesabat hazırlanarkən xəta baş verdi.');
        } finally {
            setLoading(false);
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    slideAnim.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    handleClose();
                } else {
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 8,
                    }).start();
                }
            },
        })
    ).current;

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        { opacity: fadeAnim, backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }
                    ]}
                >
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        onPress={handleClose}
                        activeOpacity={1}
                    />
                </Animated.View>

                {/* Loading Process Overlay */}
                {loading && (
                    <View style={[styles.loadingOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)' }]}>
                        <ActivityIndicator size="large" color="#1976D2" />
                        <Text style={[styles.loadingText, isDark && styles.darkLoadingText]}>
                            Hesabat hazırlanır...
                        </Text>
                        <Text style={[styles.loadingSubText, isDark && styles.darkLoadingSubText]}>
                            Zəhmət olmasa gözləyin
                        </Text>
                    </View>
                )}

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 50} // Increased offset
                >
                    <Animated.View
                        style={[
                            styles.sheetContainer,
                            {
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: scaleAnim }
                                ],
                                backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                                // Move up when keyboard is open logic is handled by KeyboardAvoidingView usually,
                                // but we add extra paddingBottom to ensure inputs are visible.
                                paddingBottom: 50 // Extra padding
                            },
                        ]}
                    >
                        {/* Drag Handle */}
                        <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
                            <View style={[styles.dragHandle, isDark && styles.darkDragHandle]} />
                        </View>

                        <View style={styles.content}>
                            <View style={styles.header}>
                                {/* ... Header content ... */}
                                <View style={styles.iconContainer}>
                                    <View style={[styles.iconBadge, { backgroundColor: isDark ? '#2C3E50' : '#E3F2FD' }]}>
                                        <MaterialCommunityIcons name="file-excel" size={28} color={isDark ? '#FFF' : '#1976D2'} />
                                    </View>
                                </View>
                                <View style={styles.headerTextContainer}>
                                    <Animated.Text style={[styles.title, isDark && styles.darkTitle]}>
                                        İllik Hesabat
                                    </Animated.Text>
                                    <Animated.Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>
                                        Excel hesabatı üçün il aralığını seçin
                                    </Animated.Text>
                                </View>
                            </View>

                            <View style={styles.inputsContainer}>
                                <View style={styles.inputWrapper}>
                                    <TextLabel isDark={isDark}>Başlanğıc İli</TextLabel>
                                    <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                                        <TextInput
                                            style={[styles.input, isDark && styles.darkInput]}
                                            value={startYear}
                                            onChangeText={setStartYear}
                                            keyboardType="number-pad"
                                            maxLength={4}
                                            placeholder="YYYY"
                                            placeholderTextColor={isDark ? '#666' : '#999'}
                                            returnKeyType="next"
                                        />
                                    </View>
                                </View>

                                <View style={styles.arrowContainer}>
                                    <Feather name="arrow-right" size={24} color={isDark ? '#666' : '#999'} />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <TextLabel isDark={isDark}>Bitiş İli</TextLabel>
                                    <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                                        <TextInput
                                            style={[styles.input, isDark && styles.darkInput]}
                                            value={endYear}
                                            onChangeText={setEndYear}
                                            keyboardType="number-pad"
                                            maxLength={4}
                                            placeholder="YYYY"
                                            placeholderTextColor={isDark ? '#666' : '#999'}
                                            returnKeyType="done"
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.footer, isDark && styles.darkFooter]}>
                                <TouchableOpacity
                                    style={[styles.cancelButton, isDark && styles.darkCancelButton]}
                                    onPress={handleClose}
                                >
                                    <Animated.Text style={[styles.cancelButtonText, isDark && styles.darkCancelButtonText]}>
                                        Ləğv et
                                    </Animated.Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.saveButton, loading && styles.disabledSaveButton]}
                                    onPress={handleGenerate}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={['#1976D2', '#1565C0']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.saveGradient}
                                    >
                                        <MaterialCommunityIcons name="file-download-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                        <Animated.Text style={styles.saveButtonText}>
                                            Hesabatı Hazırla
                                        </Animated.Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const TextLabel = ({ children, isDark }: { children: React.ReactNode, isDark: boolean }) => (
    <Animated.Text style={[styles.label, isDark && styles.darkLabel]}>
        {children}
    </Animated.Text>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        zIndex: 1,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999, // Ensure it's on top of everything
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    darkLoadingText: {
        color: '#FFF',
    },
    loadingSubText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    darkLoadingSubText: {
        color: '#AAA',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    keyboardView: {
        width: '100%',
        justifyContent: 'flex-end',
        zIndex: 2,
    },
    sheetContainer: {
        width: '100%',
        paddingBottom: 40,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dragHandleContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 16,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    darkDragHandle: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        marginRight: 16,
    },
    iconBadge: {
        width: 56,
        height: 56,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    darkTitle: {
        color: '#FFF',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    darkSubtitle: {
        color: '#AAA',
    },
    inputsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 32,
        justifyContent: 'space-between',
    },
    inputWrapper: {
        flex: 1,
    },
    arrowContainer: {
        paddingHorizontal: 12,
        paddingBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A4A4A',
        marginBottom: 8,
        marginLeft: 4,
    },
    darkLabel: {
        color: '#CCC',
    },
    inputContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
    },
    darkInputContainer: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    input: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    darkInput: {
        color: '#FFF',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    darkFooter: {
        // borderTopColor: 'rgba(255,255,255,0.1)',
    },
    cancelButton: {
        flex: 1,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    darkCancelButton: {
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    darkCancelButtonText: {
        color: '#AAA',
    },
    saveButton: {
        flex: 2,
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
    },
    disabledSaveButton: {
        opacity: 0.7,
    },
    saveGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});
