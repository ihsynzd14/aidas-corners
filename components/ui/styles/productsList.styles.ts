import { StyleSheet } from 'react-native';
import { colorScheme as appColorScheme } from '@/constants/colorScheme';

export const productsListStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    topBar: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    topBarActions: {
        flexDirection: 'row',
        gap: 8,
    },
    searchWrapper: {
        paddingHorizontal: 20,
        marginBottom: 8,
        paddingVertical: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 56,
        backgroundColor: appColorScheme.backgroundLight,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: appColorScheme.borderRed,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: appColorScheme.textLight,
        height: '100%',
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    cardWrapper: {
        marginBottom: 20,
    },
    card: {
        borderRadius: 20,
        backgroundColor: appColorScheme.cardLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(74, 53, 49, 0.08)',
        overflow: 'hidden',
    },
    cardAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
    },
    cardInner: {
        padding: 20,
    },
    mainSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconWrapper: {
        position: 'relative',
        marginRight: 16,
    },
    iconBadge: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: appColorScheme.lightRed,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(74, 53, 49, 0.1)',
    },
    variantBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF6B6B',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: appColorScheme.cardLight,
    },
    variantBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 20,
        fontWeight: '700',
        color: appColorScheme.textLight,
        marginBottom: 8,
        lineHeight: 28,
    },
    metaInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    priceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    priceTagIcon: {
        marginRight: 4,
    },
    priceText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4CAF50',
    },
    unitTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: 'rgba(74, 53, 49, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(74, 53, 49, 0.1)',
    },
    unitTagIcon: {
        marginRight: 4,
    },
    unitText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4A3531',
    },
    unitCount: {
        fontSize: 11,
        fontWeight: '400',
        color: '#888',
        marginLeft: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    editButton: {
        backgroundColor: appColorScheme.lightRed,
        borderColor: 'rgba(74, 53, 49, 0.1)',
    },
    deleteButton: {
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        borderColor: 'rgba(255, 68, 68, 0.2)',
    },
    variationsSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(74, 53, 49, 0.08)',
    },
    variationsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    variationsIconWrapper: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    variationsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: appColorScheme.textSubtleLight,
        flex: 1,
    },
    variationsCountBadge: {
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    variationsCountText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FF6B6B',
    },
    variationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    variationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(74, 53, 49, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(74, 53, 49, 0.08)',
    },
    variationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4A3531',
        marginRight: 8,
    },
    variationText: {
        fontSize: 13,
        color: '#4A3531',
        fontWeight: '500',
    },
    // Dark mode styles
    darkContainer: {
        backgroundColor: '#121212',
    },
    darkSearchContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    darkSearchInput: {
        color: '#fff',
    },
    darkCard: {
        backgroundColor: '#1E1E1E',
        shadowColor: '#000',
        shadowOpacity: 0.6,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 10,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    darkCardAccent: {
        backgroundColor: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
    },
    darkIconBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    darkVariantBadge: {
        backgroundColor: '#FF6B6B',
        borderColor: '#1E1E1E',
    },
    darkProductName: {
        color: '#fff',
    },
    darkPriceTag: {
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    darkPriceText: {
        color: '#81C784',
    },
    darkUnitTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    darkUnitText: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    darkUnitCount: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
    darkEditButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    darkDeleteButton: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    darkVariationsSection: {
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
    },
    darkVariationsIconWrapper: {
        backgroundColor: 'rgba(255, 107, 107, 0.15)',
    },
    darkVariationsTitle: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    darkVariationsCountBadge: {
        backgroundColor: 'rgba(255, 107, 107, 0.15)',
    },
    darkVariationChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    darkVariationDot: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
    darkVariationText: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
    },
    refreshButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(74, 53, 49, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
});
