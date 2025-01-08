import React from 'react';
import { ThemedView } from '@/components/ThemedView';
import { EmptyOrdersTableState } from './EmptyOrderState';
import { BranchSection } from './BranchSection';

interface OrdersSummaryTableProps {
  ordersData: Record<string, Record<string, number>>;
  selectedDate: Date;
  onDataChange: () => void;
}

export function OrdersSummaryTable({ ordersData, selectedDate, onDataChange }: OrdersSummaryTableProps) {
  if (!ordersData || Object.keys(ordersData).length === 0) {
    return (
      <ThemedView style={{ padding: 16, alignItems: 'center' }}>
         <EmptyOrdersTableState />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ paddingHorizontal: 8 }}>
      {Object.entries(ordersData).map(([branchName, products]) => (
        <BranchSection 
          key={branchName} 
          branchName={branchName} 
          products={products}
          selectedDate={selectedDate}
          onDataChange={onDataChange}
        />
      ))}
    </ThemedView>
  );
}