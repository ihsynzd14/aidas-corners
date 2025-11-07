import React, { useState } from 'react';
import { ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PastryColors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface EnhancedScrollViewProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  scrollRef?: React.RefObject<ScrollView>;
  contentContainerStyle?: any;
  isExpanded?: boolean;
}

export const EnhancedScrollView = ({
  children,
  onRefresh,
  scrollRef,
  contentContainerStyle,
  isExpanded = false,
}: EnhancedScrollViewProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const isDark = useColorScheme() === 'dark';

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scrollView}
      scrollEventThrottle={16}
      contentContainerStyle={contentContainerStyle}
      scrollEnabled={!isExpanded}
      showsVerticalScrollIndicator={true}
      bounces={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          colors={[PastryColors.chocolate, PastryColors.rosePink]}
          progressBackgroundColor={isDark ? PastryColors.chocolate : PastryColors.vanilla}
          progressViewOffset={20}
          title="Yüklənir..."
          titleColor={isDark ? PastryColors.vanilla : PastryColors.chocolate}
        />
      }
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
