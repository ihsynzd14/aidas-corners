import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StatisticsCardShimmerProps {
  isDarkMode: boolean;
  theme: {
    card: string;
    text: string;
    textSubtle: string;
  };
}

const { width: screenWidth } = Dimensions.get('window');

export const StatisticsCardShimmer: React.FC<StatisticsCardShimmerProps> = ({
  isDarkMode,
  theme
}) => {
  const shimmerColors = isDarkMode
    ? ['#2a2a2a', '#3a3a3a', '#2a2a2a']
    : ['#f0f0f0', '#e0e0e0', '#f0f0f0'];

  return (
    <View style={[
      styles.card,
      styles.statisticsCard,
      { backgroundColor: theme.card, shadowColor: isDarkMode ? 'transparent' : 'rgba(0,0,0,0.1)' }
    ]}>
      {/* Header Shimmer */}
      <View style={styles.statsHeader}>
        <View style={styles.statsTextContainer}>
          <View style={[styles.shimmerLine, { width: '80%', height: 24 }]} />
          <View style={[styles.shimmerLine, { width: '60%', height: 16, marginTop: 8 }]} />
        </View>
        <View style={[styles.iconShimmer, { width: 48, height: 48, borderRadius: 12 }]} />
      </View>

      {/* Section Header Shimmer */}
      <View style={styles.topProductsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.shimmerLine, { width: 16, height: 16, borderRadius: 4, marginRight: 8 }]} />
            <View style={[styles.shimmerLine, { width: 120, height: 18 }]} />
          </View>
        </View>

        {/* Top Products List Shimmer */}
        <View style={styles.topProductsList}>
          {[1, 2, 3].map((index) => (
            <View key={index} style={styles.topProductItem}>
              <View style={styles.productRank}>
                <View style={[styles.shimmerLine, { width: 24, height: 20, borderRadius: 4 }]} />
              </View>
              <View style={styles.productInfo}>
                <View style={[styles.shimmerLine, { width: '90%', height: 16 }]} />
                <View style={[styles.shimmerLine, { width: '60%', height: 14, marginTop: 4 }]} />
              </View>
              <View style={styles.productTrend}>
                <View style={[styles.shimmerLine, { width: 14, height: 14, borderRadius: 2 }]} />
                <View style={[styles.shimmerLine, { width: 40, height: 16, marginLeft: 4 }]} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Progress Bar Shimmer */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <View style={[styles.shimmerLine, { width: 80, height: 14 }]} />
          <View style={[styles.shimmerLine, { width: 50, height: 16, marginLeft: 8 }]} />
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={shimmerColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: '75%' }]}
          />
        </View>
      </View>

      </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  statisticsCard: {
    minHeight: 280,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statsTextContainer: {
    flex: 1,
  },
  iconShimmer: {
    borderRadius: 12,
  },
  shimmerLine: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  topProductsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topProductsList: {
    gap: 12,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productRank: {
    width: 32,
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  });