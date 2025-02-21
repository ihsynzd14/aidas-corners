import { Animated } from 'react-native';

export interface SalesData {
  product: {
    name: string;
    normalizedName: string;
    category: string;
    restrictions?: string[];
  };
  sales: {
    total: number;
    byBranch: Record<string, number>;
    byGroup: {
      next: number;
      coffemania: number;
    };
    daily: {
      date: string;
      amount: number;
      branch: string;
    }[];
  };
  trends: {
    maxDay: { date: string; amount: number };
    minDay: { date: string; amount: number };
    average: number;
    growth: number;
  };
}

export interface BranchGroups {
  next: string[];
  coffemania: string[];
}

export interface ProductGroups {
  A: string[]; // 500+
  B: string[]; // 200-499
  C: string[]; // 100-199
  D: string[]; // 50-99
  E: string[]; // 0-49
}

export interface ComparisonResult {
  product: string;
  difference: {
    absolute: number;
    percentage: number;
  };
  efficiency: {
    score: number;
    better: 'next' | 'coffemania' | 'equal';
    reason: string;
  };
}

export interface TrendAnalysis {
  product: string;
  trend: {
    direction: 'up' | 'down' | 'stable';
    changeRate: number;
  };
  peakDays: {
    date: string;
    amount: number;
  }[];
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  opacity?: Animated.Value;
  translateY?: Animated.Value;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  type: 'comparison' | 'topSelling' | 'insight';
  timestamp: number;
}

export interface NotificationHistoryState {
  notifications: NotificationHistoryItem[];
} 