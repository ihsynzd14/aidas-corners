import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PastryColors } from '@/constants/Colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonItem = ({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonLoaderProps) => {
  const isDark = useColorScheme() === 'dark';
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmer.value,
      [0, 0.5, 1],
      [0.3, 0.6, 0.3]
    );

    return { opacity };
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: isDark 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(74, 53, 49, 0.08)',
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export const SkeletonBranchCard = () => {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.branchCard,
        {
          backgroundColor: isDark ? PastryColors.chocolate : PastryColors.vanilla,
        },
      ]}
    >
      <View style={styles.branchHeader}>
        <View style={styles.branchInfo}>
          <SkeletonItem width={44} height={44} borderRadius={22} />
          <View style={styles.branchText}>
            <SkeletonItem width={120} height={18} style={{ marginBottom: 8 }} />
            <SkeletonItem width={80} height={14} />
          </View>
        </View>
        <View style={styles.branchActions}>
          <SkeletonItem width={36} height={36} borderRadius={18} style={{ marginRight: 8 }} />
          <SkeletonItem width={36} height={36} borderRadius={18} style={{ marginRight: 8 }} />
          <SkeletonItem width={36} height={36} borderRadius={18} />
        </View>
      </View>
    </View>
  );
};

export const SkeletonOrdersTable = () => {
  return (
    <View style={styles.tableContainer}>
      <SkeletonBranchCard />
      <SkeletonBranchCard />
      <SkeletonBranchCard />
    </View>
  );
};

export const SkeletonDatePicker = () => {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.datePicker,
        {
          backgroundColor: isDark ? PastryColors.chocolate : PastryColors.vanilla,
        },
      ]}
    >
      <SkeletonItem width={40} height={40} borderRadius={20} />
      <SkeletonItem width={150} height={24} />
      <SkeletonItem width={40} height={40} borderRadius={20} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  branchCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  branchHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  branchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  branchText: {
    marginLeft: 14,
  },
  branchActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableContainer: {
    paddingHorizontal: 8,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SkeletonItem;
