import React, { useEffect, useState, useRef } from 'react';
import { ProductDefinition } from '../../utils/firebase';
import {
    StyleSheet,
    Modal,
    View,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    useColorScheme,
    Animated,
    PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddProductSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (newProduct: Omit<ProductDefinition, 'id'>) => Promise<void>;
}

export const AddProductSheet: React.FC<AddProductSheetProps> = ({
    visible,
    onClose,
    onSave,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [productName, setProductName] = useState('');
    const [variations, setVariations] = useState<string[]>([]);
    const [newVariation, setNewVariation] = useState('');
    const [saving, setSaving] = useState(false);

    // Price state
    const [price, setPrice] = useState('');

    // Units state
    const [unitType, setUnitType] = useState<'weight' | 'piece' | 'box' | null>(null);
    const [unitVariations, setUnitVariations] = useState<string[]>([]);
    const [newUnitVariation, setNewUnitVariation] = useState('');

    // Animation values
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            // Reset form
            setProductName('');
            setVariations([]);
            setNewVariation('');
            setPrice('');
            setUnitType(null);
            setUnitVariations([]);
            setNewUnitVariation('');

            // Reset animations
            slideAnim.setValue(SCREEN_HEIGHT);
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.9);

            // Start entrance animations
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

    const handleSave = async () => {
        if (!productName.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSaving(true);
        try {
            const newProduct: any = {
                correct: productName.trim(),
                variations: variations.filter(v => v.trim().length > 0),
                isActive: true,
            };

            // Include price if provided
            if (price.trim()) {
                const priceValue = parseFloat(price.replace(',', '.'));
                if (!isNaN(priceValue) && priceValue > 0) {
                    newProduct.price = priceValue;
                    // priceHistory-ni yeni məhsul üçün başlat
                    newProduct.priceHistory = [{ price: priceValue, effectiveFrom: new Date() }];
                }
            }

            // Only include units if unitType is not null and there are variations
            if (unitType && unitVariations.filter(v => v.trim().length > 0).length > 0) {
                newProduct.units = {
                    type: unitType,
                    variations: unitVariations.filter(v => v.trim().length > 0),
                };
            }

            console.log('AddProductSheet saving data:', newProduct);
            await onSave(newProduct);
            handleClose();
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const addVariation = () => {
        if (newVariation.trim()) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setVariations([...variations, newVariation.trim()]);
            setNewVariation('');
        }
    };

    const removeVariation = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setVariations(variations.filter((_, i) => i !== index));
    };

    const addUnitVariation = () => {
        if (newUnitVariation.trim()) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setUnitVariations([...unitVariations, newUnitVariation.trim()]);
            setNewUnitVariation('');
        }
    };

    const removeUnitVariation = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setUnitVariations(unitVariations.filter((_, i) => i !== index));
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
            onPanResponderTerminate: () => {
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }).start();
            }
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
                        { opacity: fadeAnim }
                    ]}
                >
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        onPress={handleClose}
                        activeOpacity={1}
                    />
                </Animated.View>

        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
                    <Animated.View
                        style={[
                            styles.sheetContainer,
                            {
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: scaleAnim }
                                ],
                            },
                        ]}
                    >
                        <BlurView
                            intensity={isDark ? 40 : 60}
                            tint={isDark ? 'dark' : 'light'}
                            style={StyleSheet.absoluteFill}
                        />

                        {/* Gradient Border Top */}
                        <LinearGradient
                            colors={isDark ? ['#4CAF50', 'transparent'] : ['#4CAF50', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientBorder}
                        />

                        {/* Drag Handle */}
                        <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
                            <View style={[styles.dragHandle, isDark && styles.darkDragHandle]} />
                        </View>

                        <View style={styles.content}>
                            {/* Header */}
                            <View style={styles.header}>
                                <View>
                                    <LinearGradient
                                        colors={isDark ? ['#4CAF50', '#388E3C'] : ['#4CAF50', '#388E3C']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.iconBadge}
                                    >
                                        <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
                                    </LinearGradient>
                                </View>
                                <View style={styles.headerTextContainer}>
                                    <Animated.Text style={[styles.title, isDark && styles.darkTitle]}>
                                        Yeni Məhsul Əlavə Et
                                    </Animated.Text>
                                    <Animated.Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>
                                        Məhsul məlumatlarını daxil edin
                                    </Animated.Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleClose}
                                    style={[styles.closeButton, isDark && styles.darkCloseButton]}
                                >
                                    <Ionicons name="close" size={20} color={isDark ? '#FFF' : '#000'} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContentContainer}
                            >
                                {/* Product Name Input */}
                                <View style={styles.inputGroup}>
                                    <TextLabel isDark={isDark}>Düzgün Ad</TextLabel>
                                    <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                                        <TextInput
                                            style={[styles.input, isDark && styles.darkInput]}
                                            value={productName}
                                            onChangeText={setProductName}
                                            placeholder="Məhsulun adını daxil edin"
                                            placeholderTextColor={isDark ? '#666' : '#999'}
                                        />
                                        {productName.length > 0 && (
                                            <Feather name="check-circle" size={18} color={isDark ? '#4CAF50' : '#4CAF50'} />
                                        )}
                                    </View>
                                </View>

                                {/* Price Input */}
                                <View style={styles.inputGroup}>
                                    <TextLabel isDark={isDark}>Qiymət (AZN)</TextLabel>
                                    <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                                        <Feather name="tag" size={18} color={isDark ? '#999' : '#666'} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, isDark && styles.darkInput]}
                                            value={price}
                                            onChangeText={setPrice}
                                            placeholder="0.00"
                                            placeholderTextColor={isDark ? '#666' : '#999'}
                                            keyboardType="decimal-pad"
                                        />
                                        <Animated.Text style={[styles.currencyText, isDark && styles.darkCurrencyText]}>
                                            AZN
                                        </Animated.Text>
                                    </View>
                                </View>

                                {/* Variations Section */}
                                <View style={styles.inputGroup}>
                                    <View style={styles.sectionHeader}>
                                        <TextLabel isDark={isDark}>Variantlar ({variations.length})</TextLabel>
                                        <TouchableOpacity
                                            onPress={() => setVariations([])}
                                            disabled={variations.length === 0}
                                        >
                                            <Animated.Text style={[styles.clearText, { opacity: variations.length ? 1 : 0.5 }]}>
                                                Təmizlə
                                            </Animated.Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={[styles.addVariationContainer, isDark && styles.darkInputContainer]}>
                                        <TextInput
                                            style={[styles.input, isDark && styles.darkInput]}
                                            value={newVariation}
                                            onChangeText={setNewVariation}
                                            placeholder="Yeni variant əlavə et..."
                                            placeholderTextColor={isDark ? '#666' : '#999'}
                                            onSubmitEditing={addVariation}
                                        />
                                        <TouchableOpacity
                                            style={[
                                                styles.addButton,
                                                isDark && styles.darkAddButton,
                                                !newVariation.trim() && styles.disabledButton
                                            ]}
                                            onPress={addVariation}
                                            disabled={!newVariation.trim()}
                                        >
                                            <Ionicons name="add" size={20} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.variationsList}>
                                        {variations.map((variation, index) => (
                                            <Animated.View
                                                key={`${variation}-${index}`}
                                                style={[styles.variationChip, isDark && styles.darkVariationChip]}
                                            >
                                                <Animated.Text style={[styles.variationText, isDark && styles.darkVariationText]}>
                                                    {variation}
                                                </Animated.Text>
                                                <TouchableOpacity
                                                    onPress={() => removeVariation(index)}
                                                    style={styles.removeVariationBtn}
                                                >
                                                    <Ionicons name="close-circle" size={16} color={isDark ? '#FF6B6B' : '#FF4444'} />
                                                </TouchableOpacity>
                                            </Animated.View>
                                        ))}
                                    </View>
                                </View>

                                {/* Units Section */}
                                <View style={styles.inputGroup}>
                                    <View style={styles.sectionHeader}>
                                        <TextLabel isDark={isDark}>Vahid Parametrləri</TextLabel>
                                    </View>

                                    {/* Unit Type Selector */}
                                    <View style={styles.unitTypeContainer}>
                                        {([null, 'weight', 'piece', 'box'] as const).map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[
                                                    styles.unitTypeButton,
                                                    isDark && styles.darkUnitTypeButton,
                                                    unitType === type && styles.activeUnitTypeButton,
                                                    unitType === type && isDark && styles.darkActiveUnitTypeButton
                                                ]}
                                                onPress={() => setUnitType(type)}
                                            >
                                                <MaterialCommunityIcons
                                                    name={type === 'weight' ? 'scale' : type === 'box' ? 'package-variant' : type === 'piece' ? 'puzzle-outline' : 'close-circle-outline'}
                                                    size={20}
                                                    color={unitType === type ? '#FFF' : (isDark ? '#999' : '#666')}
                                                />
                                                <Animated.Text style={[
                                                    styles.unitTypeText,
                                                    isDark && styles.darkUnitTypeText,
                                                    unitType === type && styles.activeUnitTypeText,
                                                    unitType === type && isDark && styles.darkActiveUnitTypeText
                                                ]}>
                                                    {type === 'weight' ? 'Çəki' : type === 'box' ? 'Qutu' : type === 'piece' ? 'Ədəd' : 'Yoxdur'}
                                                </Animated.Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Unit Variations - Only show if unit type is selected */}
                                    {unitType && (
                                        <>
                                            <View style={[styles.sectionHeader, { marginTop: 16 }]}>
                                                <TextLabel isDark={isDark}>Vahid Variantları ({unitVariations.length})</TextLabel>
                                                <TouchableOpacity
                                                    onPress={() => setUnitVariations([])}
                                                    disabled={unitVariations.length === 0}
                                                >
                                                    <Animated.Text style={[styles.clearText, { opacity: unitVariations.length ? 1 : 0.5 }]}>
                                                        Təmizlə
                                                    </Animated.Text>
                                                </TouchableOpacity>
                                            </View>

                                            <View style={[styles.addVariationContainer, isDark && styles.darkInputContainer]}>
                                                <TextInput
                                                    style={[styles.input, isDark && styles.darkInput]}
                                                    value={newUnitVariation}
                                                    onChangeText={setNewUnitVariation}
                                                    placeholder="Yeni vahid variantı..."
                                                    placeholderTextColor={isDark ? '#666' : '#999'}
                                                    onSubmitEditing={addUnitVariation}
                                                />
                                                <TouchableOpacity
                                                    style={[
                                                        styles.addButton,
                                                        isDark && styles.darkAddButton,
                                                        !newUnitVariation.trim() && styles.disabledButton
                                                    ]}
                                                    onPress={addUnitVariation}
                                                    disabled={!newUnitVariation.trim()}
                                                >
                                                    <Ionicons name="add" size={20} color="#FFF" />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={styles.variationsList}>
                                                {unitVariations.map((variation, index) => (
                                                    <Animated.View
                                                        key={`unit-${variation}-${index}`}
                                                        style={[styles.variationChip, isDark && styles.darkVariationChip]}
                                                    >
                                                        <Animated.Text style={[styles.variationText, isDark && styles.darkVariationText]}>
                                                            {variation}
                                                        </Animated.Text>
                                                        <TouchableOpacity
                                                            onPress={() => removeUnitVariation(index)}
                                                            style={styles.removeVariationBtn}
                                                        >
                                                            <Ionicons name="close-circle" size={16} color={isDark ? '#FF6B6B' : '#FF4444'} />
                                                        </TouchableOpacity>
                                                    </Animated.View>
                                                ))}
                                            </View>
                                        </>
                                    )}
                                </View>
                            </ScrollView>

                            {/* Footer Actions */}
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
                                    style={[styles.saveButton, saving && styles.disabledSaveButton]}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    <LinearGradient
                                        colors={['#4CAF50', '#388E3C']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.saveGradient}
                                    >
                                        {saving ? (
                                            <Animated.View style={styles.loadingSpinner}>
                                                <Feather name="loader" size={20} color="#FFF" />
                                            </Animated.View>
                                        ) : (
                                            <>
                                                <Feather name="plus" size={18} color="#FFF" style={{ marginRight: 8 }} />
                                                <Animated.Text style={[styles.saveButtonText, isDark && styles.darkSaveButtonText]}>
                                                    Əlavə Et
                                                </Animated.Text>
                                            </>
                                        )}
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
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    keyboardView: {
        width: '100%',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        width: '100%',
        height: SCREEN_HEIGHT * 0.8,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255,255,255,0.95)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    gradientBorder: {
        height: 4,
        width: '100%',
        opacity: 0.5,
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
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    darkTitle: {
        color: '#FFF',
    },
    subtitle: {
        fontSize: 13,
        color: '#666',
    },
    darkSubtitle: {
        color: '#AAA',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    darkCloseButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: 120,
    },
    inputGroup: {
        marginBottom: 24,
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    darkInputContainer: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
        height: '100%',
    },
    darkInput: {
        color: '#FFF',
    },
    inputIcon: {
        marginRight: 12,
    },
    currencyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A3531',
        marginLeft: 8,
    },
    darkCurrencyText: {
        color: '#E0C1BC',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    clearText: {
        fontSize: 13,
        color: '#FF4444',
        fontWeight: '600',
    },
    addVariationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        paddingLeft: 16,
        paddingRight: 6,
        height: 56,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
    },
    darkAddButton: {
        backgroundColor: '#4CAF50',
    },
    disabledButton: {
        opacity: 0.5,
    },
    variationsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    variationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    darkVariationChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    variationText: {
        fontSize: 14,
        color: '#4A3531',
        marginRight: 8,
        fontWeight: '500',
    },
    darkVariationText: {
        color: '#E0C1BC',
    },
    removeVariationBtn: {
        padding: 2,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#FFF',
    },
    darkFooter: {
        borderTopColor: 'rgba(255,255,255,0.1)',
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#1E1E1E',
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
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledSaveButton: {
        opacity: 0.7,
    },
    saveGradient: {
        flex: 1,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    darkSaveButtonText: {
        color: '#FFF',
    },
    loadingSpinner: {
        transform: [{ rotate: '45deg' }],
    },
    unitTypeContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    unitTypeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        gap: 6,
    },
    darkUnitTypeButton: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activeUnitTypeButton: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    darkActiveUnitTypeButton: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    unitTypeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    darkUnitTypeText: {
        color: '#AAA',
    },
    activeUnitTypeText: {
        color: '#FFF',
    },
    darkActiveUnitTypeText: {
        color: '#FFF',
    },
});
