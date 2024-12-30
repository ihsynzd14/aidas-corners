import { IconSymbolName } from '@/components/ui/IconSymbol';

export type TabRoute = 'index' | 'explore' | 'new_orders';

export interface TabItem {
  name: TabRoute;
  title: string;
  icon: IconSymbolName;
}

export type TabConfig = TabItem[];