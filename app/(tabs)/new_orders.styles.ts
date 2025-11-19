import { StyleSheet, Platform } from 'react-native';
import { colorScheme } from '@/constants/colorScheme';

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colorScheme.backgroundLight,
    },
    safeAreaLight: {
        backgroundColor: colorScheme.backgroundLight,
    },
    safeAreaDark: {
        backgroundColor: colorScheme.backgroundDark,
    },
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerLight: {
        backgroundColor: 'rgba(248, 246, 246, 0.8)', // background-light/80
        borderBottomColor: 'rgba(226, 232, 240, 0.8)', // slate-200/80
    },
    headerDark: {
        backgroundColor: 'rgba(34, 16, 19, 0.8)', // background-dark/80
        borderBottomColor: 'rgba(30, 41, 59, 0.8)', // slate-800/80
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerRightPlaceholder: {
        width: 40,
        height: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 112, // pb-28
        paddingTop: 24, // pt-6
    },
    formContainer: {
        flexDirection: 'column',
        gap: 16,
        paddingHorizontal: 16,
    },
    inputGroup: {
        flexDirection: 'column',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    dateInputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    input: {
        height: 56, // h-14
        width: '100%',
        borderRadius: 12, // rounded-xl
        borderWidth: 1,
        paddingLeft: 48, // pl-12
        paddingRight: 16, // pr-4
        justifyContent: 'center',
        backgroundColor: colorScheme.white, // Requested: fields have bg, preferably white
    },
    inputLight: {
        borderColor: colorScheme.primary,
        backgroundColor: colorScheme.white,
    },
    inputDark: {
        borderColor: colorScheme.slate700,
        backgroundColor: colorScheme.cardDark, // Adapt for dark mode
    },
    inputText: {
        fontSize: 16,
    },
    selectInput: {
        flexDirection: 'row',
        height: 56,
        width: '100%',
        alignItems: 'center',
        borderRadius: 12,
        paddingLeft: 16,
        paddingRight: 16,
        borderWidth: 1,
        borderColor: colorScheme.primary,
        backgroundColor: colorScheme.white, // Requested: fields have bg
    },
    inputIconLeft: {
        marginRight: 8,
    },
    selectText: {
        flex: 1,
        fontSize: 16,
    },
    placeholderText: {
        color: colorScheme.slate500,
    },
    textArea: {
        width: '100%',
        minHeight: 120,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: colorScheme.white, // Requested: fields have bg
    },
    textAreaLight: {
        backgroundColor: colorScheme.white,
        borderColor: colorScheme.primary,
    },
    textAreaDark: {
        backgroundColor: colorScheme.cardDark,
        borderColor: colorScheme.slate700,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        borderTopWidth: 1,
        padding: 16,
    },
    footerLight: {
        backgroundColor: 'rgba(248, 246, 246, 0.8)',
        borderTopColor: 'rgba(226, 232, 240, 0.8)',
    },
    footerDark: {
        backgroundColor: 'rgba(34, 16, 19, 0.8)',
        borderTopColor: 'rgba(30, 41, 59, 0.8)',
    },
    saveButton: {
        height: 56,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: colorScheme.accentGreen, // Requested: green color
        shadowColor: colorScheme.accentGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.7,
        backgroundColor: colorScheme.slate400, // Visual feedback for disabled state
    },
    saveButtonText: {
        color: colorScheme.white, // Requested: text white
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.24,
    },
    textSlate100: { color: colorScheme.slate100 },
    textSlate300: { color: colorScheme.slate300 },
    textSlate700: { color: colorScheme.slate700 },
    textSlate900: { color: colorScheme.slate900 },

    // Preview Section Styles
    previewContainer: {
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    previewContainerLight: {
        backgroundColor: colorScheme.white,
        borderColor: colorScheme.primary,
    },
    previewContainerDark: {
        backgroundColor: colorScheme.cardDark,
        borderColor: colorScheme.slate700,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        // backgroundColor: 'transparent', // Or a subtle background
    },
    previewHeaderTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    previewContent: {
        padding: 16,
        paddingTop: 0,
    },
    previewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    previewItemLast: {
        borderBottomWidth: 0,
    },
    previewItemName: {
        fontSize: 15,
        flex: 1,
        marginRight: 16,
    },
    previewItemQuantity: {
        fontSize: 15,
        fontWeight: '600',
        color: colorScheme.accentBlue,
    },
    previewBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: colorScheme.borderRed,
    },
    previewBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: colorScheme.black,
    },
});
