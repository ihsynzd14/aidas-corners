import { StyleSheet, Dimensions } from 'react-native';
import { Breakpoints } from '@/constants/DesignTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive scaling functions
const scale = Math.max(0.8, Math.min(1.2, SCREEN_WIDTH / 375)); // Base: iPhone SE
const fontScale = Math.max(0.85, Math.min(1.15, SCREEN_WIDTH / 375));

const scaleSize = (size: number) => Math.round(size * scale);
const scaleFont = (size: number) => Math.round(size * fontScale);

// Responsive spacing based on screen size
const getResponsivePadding = () => {
  if (SCREEN_WIDTH < Breakpoints.sm) return 16; // Very small screens
  if (SCREEN_WIDTH < Breakpoints.md) return 20; // Small screens
  if (SCREEN_WIDTH < Breakpoints.lg) return 24; // Medium screens
  return 28; // Large screens
};

const getResponsiveGap = () => {
  if (SCREEN_WIDTH < Breakpoints.sm) return 6; // Compact for small screens
  if (SCREEN_WIDTH < Breakpoints.md) return 8; // Medium screens
  return 10; // Standard gap for larger screens
};

const getResponsiveBottomPadding = () => {
  // Space between last content and bottom navigation
  // BottomNavigationBar height ~70px + spacing for visibility
  if (SCREEN_WIDTH < Breakpoints.sm) return 100; // Small screens
  if (SCREEN_WIDTH < Breakpoints.md) return 110; // Medium screens
  return 120; // Large screens
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: getResponsivePadding(),
    paddingBottom: scaleSize(4),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    marginBottom: scaleSize(2),
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(6),
    borderRadius: scaleSize(20),
    alignSelf: 'flex-start',
    minWidth: scaleSize(200),
  },
  insightText: {
    fontSize: scaleFont(12),
    marginLeft: scaleSize(4),
    flexShrink: 1,
    minWidth: 0,
  },
  notificationButton: {
    padding: scaleSize(8),
    borderRadius: scaleSize(50),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: getResponsivePadding(),
    paddingBottom: getResponsiveBottomPadding(),
    gap: getResponsiveGap(),
  },
  statsRow: {
    flexDirection: 'row',
    gap: getResponsiveGap(),
  },
  card: {
    borderRadius: scaleSize(16),
    padding: scaleSize(14),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1 }],
  },
  compactCard: {
    flex: 1,
    // Removed aspectRatio to allow content-based height
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    padding: scaleSize(12),
    borderRadius: scaleSize(16),
  },
  count: {
    fontSize: scaleFont(24),
  },
  cardContent: {
    marginTop: scaleSize(8), // Reduced spacing between icon/count and title
    paddingTop: 0, // Removed extra padding
  },
  cardTitle: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    marginBottom: scaleSize(4), // Increased spacing between title and subtitle
  },
  cardSubtitle: {
    fontSize: scaleFont(12),
  },
  statisticsCard: {
    flexDirection: 'column',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: getResponsiveGap(),
  },
  statsTextContainer: {
    flex: 1,
  },
  topProductsSection: {
    marginBottom: getResponsiveGap(),
  },
  sectionHeader: {
    marginBottom: scaleSize(8),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
  },
  sectionTitle: {
    fontSize: scaleFont(13),
    fontWeight: '600',
  },
  topProductsList: {
    gap: scaleSize(8),
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleSize(6),
    paddingHorizontal: scaleSize(8),
  },
  productRank: {
    width: scaleSize(24),
    alignItems: 'center',
    marginRight: scaleSize(10),
  },
  rankNumber: {
    fontSize: scaleFont(11),
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
    marginRight: scaleSize(8),
  },
  productName: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    marginBottom: scaleSize(2),
  },
  productCount: {
    fontSize: scaleFont(10),
  },
  productTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
  },
  trendText: {
    fontSize: scaleFont(11),
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: getResponsiveGap(),
    paddingTop: getResponsiveGap(),
    borderTopWidth: 1,
  },
  categoryList: {
    gap: scaleSize(8),
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scaleSize(6),
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(8),
    flex: 1,
  },
  categoryDot: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
  },
  categoryName: {
    fontSize: scaleFont(12),
    fontWeight: '500',
  },
  categoryCount: {
    fontSize: scaleFont(13),
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: scaleSize(4),
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSize(6),
  },
  progressLabel: {
    fontSize: scaleFont(11),
  },
  progressBar: {
    height: scaleSize(6),
    backgroundColor: '#D9A6A320',
    borderRadius: scaleSize(3),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: scaleSize(3),
  },
  progressText: {
    fontSize: scaleFont(11),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scaleSize(20),
  },
  errorText: {
    fontSize: scaleFont(12),
    textAlign: 'center',
    lineHeight: scaleFont(16),
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scaleSize(16),
  },
  noDataText: {
    fontSize: scaleFont(12),
    textAlign: 'center',
    fontStyle: 'italic',
  },
  weeklyGrowthText: {
    fontSize: scaleFont(10),
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: getResponsiveGap(),
  },
  quickActionCard: {
    flex: 1,
    minHeight: scaleSize(70),
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    marginBottom: scaleSize(8),
  },
  quickActionTitle: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    textAlign: 'center',
  },
  managementCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  managementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  managementIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(16),
    flex: 1,
  },
  managementText: {
    flex: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: scaleSize(12),
    paddingHorizontal: getResponsivePadding(),
    borderTopWidth: 1,
    // Backdrop blur effect simulation
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 15,
  },
  tab: {
    alignItems: 'center',
    gap: scaleSize(4),
  },
  activeTabIcon: {
    width: scaleSize(32),
    height: scaleSize(32),
    borderRadius: scaleSize(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: scaleFont(10),
  },
});

