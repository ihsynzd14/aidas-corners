// Test file to verify OrdersSummaryHeader component
import React from 'react';
import { OrdersSummaryHeader } from '../components/stocks/OrdersSummaryHeader';

// This is just a test to verify imports work
console.log('OrdersSummaryHeader component imported successfully');

export default function TestComponent() {
  return (
    <OrdersSummaryHeader
      selectedDate={new Date()}
      onDateChange={(date) => console.log('Date changed:', date)}
    />
  );
}