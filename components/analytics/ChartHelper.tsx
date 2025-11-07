import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors, PastryColors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface ChartHelperProps {
  selectedPeriod: 'daily' | 'weekly' | 'monthly';
}

export function ChartHelper({ selectedPeriod }: ChartHelperProps) {
  const isDark = useColorScheme() === 'dark';

  const getHelperContent = () => {
    switch (selectedPeriod) {
      case 'daily':
        return {
          icon: 'calendar-today',
          title: 'Günlük Görünüş',
          description: 'Hər gün üçün ayrı-ayrı satış məlumatları göstərilir.',
          details: [
            'X oxu: Tarix (GG/AA formatında)',
            'Y oxu: Günlük satış miqdarı',
            'Hər nöqtə bir günün satışını göstərir'
          ]
        };
      case 'weekly':
        return {
          icon: 'calendar-week',
          title: 'Həftəlik Görünüş',
          description: 'Həftələr üzrə qruplaşdırılmış satış məlumatları.',
          details: [
            'X oxu: Həftə nömrəsi (H1, H2, ...)',
            'Y oxu: Həftəlik ümumi satış',
            'Hər həftənin bütün günlərinin cəmi'
          ]
        };
      case 'monthly':
        return {
          icon: 'calendar-month',
          title: 'Aylıq Görünüş',
          description: 'Aylar üzrə qruplaşdırılmış satış məlumatları.',
          details: [
            'X oxu: Ay (AA/İİ formatında)',
            'Y oxu: Aylıq ümumi satış',
            'Hər ayın bütün günlərinin cəmi'
          ]
        };
      default:
        return null;
    }
  };

  const content = getHelperContent();
  if (!content) return null;

  return (
    <ThemedView style={[
      styles.container,
      {
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      }
    ]}>
      <View style={styles.header}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: `${PastryColors.primary}20` }
        ]}>
          <MaterialCommunityIcons
            name={content.icon as any}
            size={18}
            color={PastryColors.primary}
          />
        </View>
        <View style={styles.titleContainer}>
          <ThemedText style={[
            styles.title,
            { color: isDark ? PastryColors.vanilla : PastryColors.chocolate }
          ]}>
            {content.title}
          </ThemedText>
          <ThemedText style={[
            styles.description,
            { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(74,53,49,0.7)' }
          ]}>
            {content.description}
          </ThemedText>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        {content.details.map((detail, index) => (
          <View key={index} style={styles.detailItem}>
            <View style={[
              styles.bullet,
              { backgroundColor: isDark ? PastryColors.primary : PastryColors.primary }
            ]} />
            <ThemedText style={[
              styles.detailText,
              { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(74,53,49,0.8)' }
            ]}>
              {detail}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={[
        styles.tipContainer,
        {
          backgroundColor: isDark ? 'rgba(255,148,148,0.1)' : 'rgba(255,148,148,0.1)',
          borderColor: isDark ? 'rgba(255,148,148,0.3)' : 'rgba(255,148,148,0.3)',
        }
      ]}>
        <MaterialCommunityIcons
          name="lightbulb-on"
          size={14}
          color={PastryColors.primary}
        />
        <ThemedText style={[
          styles.tipText,
          { color: isDark ? PastryColors.primary : PastryColors.chocolate }
        ]}>
          Məhsul adını görmək üçün qrafiktəki nöqtələrə toxunun
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  detailsContainer: {
    gap: 8,
    paddingLeft: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  tipText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
}); 