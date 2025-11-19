import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  RefreshCw,
} from 'lucide-react-native';
import { styles } from '@/components/ui/styles/index.styles';
import { useTopProductsData } from '@/hooks/useTopProductsData';
import { StatisticsCardShimmer } from '@/components/ui/StatisticsCardShimmer';

interface StatisticsCardProps {
  isDarkMode: boolean;
  theme: {
    card: string;
    text: string;
    textSubtle: string;
  };
  colors: {
    primary: string;
    accentGreen: string;
    accentRed: string;
    accentBlue: string;
  };
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  isDarkMode,
  theme,
  colors,
}) => {
  const router = useRouter();
  const {
    products,
    totalWeeklySales,
    weeklyGrowth,
    daysRemaining,
    weekProgress,
    loading,
    error,
    refetch
  } = useTopProductsData();

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
    if (trend === 'up') return <TrendingUp size={14} color={colors.accentGreen} />;
    if (trend === 'down') return <TrendingDown size={14} color={colors.accentRed} />;
    return <Activity size={14} color={theme.textSubtle} />;
  };

  // Show shimmer while loading
  if (loading) {
    return <StatisticsCardShimmer isDarkMode={isDarkMode} theme={theme} />;
  }

  // Handle error state
  if (error) {
    return (
      <TouchableOpacity
        onPress={refetch}
        style={[
          styles.card,
          styles.statisticsCard,
          {
            backgroundColor: theme.card,
            shadowColor: isDarkMode ? 'transparent' : 'rgba(0,0,0,0.1)',
            borderLeftWidth: 3,
            borderLeftColor: colors.accentRed,
          }
        ]}
        activeOpacity={0.9}
      >
        <View style={styles.statsHeader}>
          <View style={styles.statsTextContainer}>
            <Text style={[styles.cardTitle, { color: theme.text, fontSize: 18 }]}>Məhsul Statistikası</Text>
            <Text style={[styles.cardSubtitle, { color: colors.accentRed, marginTop: 4 }]}>
              {error}
            </Text>
          </View>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.accentRed}20` }]}>
            <RefreshCw size={28} color={colors.accentRed} />
          </View>
        </View>

        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.textSubtle }]}>
            Yenidən yükləmək üçün toxun
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => router.push('/(tabs)/product_statistics')}
      style={[
        styles.card,
        styles.statisticsCard,
        { backgroundColor: theme.card, shadowColor: isDarkMode ? 'transparent' : 'rgba(0,0,0,0.1)' }
      ]}
      activeOpacity={0.9}
    >
      <View style={styles.statsHeader}>
        <View style={styles.statsTextContainer}>
          <Text style={[styles.cardTitle, { color: theme.text, fontSize: 18 }]}>Məhsul Statistikası</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSubtle, marginTop: 4 }]}>
            Bu həftə ümumi satış: {totalWeeklySales} ədəd {daysRemaining > 0 && `• ${daysRemaining} gün qalıb`}
          </Text>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.accentBlue}20` }]}>
          <PieChart size={28} color={colors.accentBlue} />
        </View>
      </View>

      {/* Top Products Section */}
      <View style={styles.topProductsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Award size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Ən çox satılanlar</Text>
          </View>
        </View>
        <View style={styles.topProductsList}>
          {products.length > 0 ? products.map((product, index) => (
            <View key={index} style={styles.topProductItem}>
              <View style={styles.productRank}>
                <Text style={[styles.rankNumber, { color: theme.textSubtle }]}>#{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={[styles.productCount, { color: theme.textSubtle }]}>
                  {product.count} satış
                </Text>
              </View>
              <View style={styles.productTrend}>
                <TrendIcon trend={product.trend} />
                <Text style={[
                  styles.trendText,
                  { 
                    color: product.trend === 'up' ? colors.accentGreen : 
                           product.trend === 'down' ? colors.accentRed : theme.textSubtle 
                  }
                ]}>
                  {product.percentage}%
                </Text>
              </View>
            </View>
          )) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: theme.textSubtle }]}>
                Bu həftədə məlumat yoxdur
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Week Progress with Growth */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressLabel, { color: theme.textSubtle }]}>Həftənin sonlanması</Text>
          <Text style={[
            styles.progressText,
            {
              color: colors.primary,
              fontWeight: '400'
            }
          ]}>
            {daysRemaining} gün qaldı
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            {
              width: `${weekProgress}%`, // Show actual week progress
              backgroundColor: colors.primary
            }
          ]} />
        </View>
        <Text style={[styles.weeklyGrowthText, {
          color: weeklyGrowth >= 0 ? colors.accentGreen : colors.accentRed,
          fontSize: 10,
          marginTop: 2
        }]}>
          Həftəlik dəyişim: {weeklyGrowth >= 0 ? '+' : ''}{weeklyGrowth}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

