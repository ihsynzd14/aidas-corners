// src/utils/orderCorrection.ts

import { getProductCorrections as getFirebaseCorrections } from './firebase';

interface ProductDefinition {
  correct: string;
  variations: string[];
  units?: {
    type: 'weight' | 'piece' | 'box';
    variations: string[];
  };
}

// Export empty array for backward compatibility (will be populated from Firebase)
export const PRODUCT_CORRECTIONS: ProductDefinition[] = [];

interface OrderItem {
  product: string;
  quantity: number;
  unit: string;
}

// ===== NEW FIREBASE-BASED FUNCTIONS =====

// Get corrections from Firebase
export async function getProductCorrections(): Promise<ProductDefinition[]> {
  try {
    const corrections = await getFirebaseCorrections();
    console.log(`Loaded ${corrections.length} product corrections from Firebase`);
    return corrections;
  } catch (error) {
    console.error('Error getting product corrections:', error);
    // Return empty array instead of fallback
    return [];
  }
}

// Import service for refresh functionality
import { orderCorrectionService } from '../services/orderCorrectionService';

// Export refresh function for manual control
export async function refreshProductCorrections(): Promise<ProductDefinition[]> {
  console.log('🔄 Refreshing product corrections from Firebase...');
  try {
    const corrections = await orderCorrectionService.refreshCorrections();
    
    // Clear and repopulate array
    PRODUCT_CORRECTIONS.length = 0;
    PRODUCT_CORRECTIONS.push(...corrections);
    
    console.log(`✅ Refreshed ${corrections.length} product corrections from Firebase`);
    return corrections;
  } catch (error) {
    console.error('❌ Failed to refresh product corrections:', error);
    throw error;
  }
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function findBestMatch(input: string, variations: string[]): Promise<string | null> {
  const normalizedInput = normalizeText(input);

  // Try exact match first
  const exactMatch = variations.find(v => normalizeText(v) === normalizedInput);
  if (exactMatch) return exactMatch;

  // Try contains match
  const containsMatch = variations.find(v => {
    const normalizedVariation = normalizeText(v);
    return normalizedInput.includes(normalizedVariation) ||
      normalizedVariation.includes(normalizedInput);
  });
  if (containsMatch) return containsMatch;

  // Try fuzzy match (allowing for small typos)
  const fuzzyMatch = variations.find(v => {
    const normalizedVariation = normalizeText(v);
    let diffCount = 0;
    const shorter = normalizedInput.length < normalizedVariation.length ? normalizedInput : normalizedVariation;
    const longer = normalizedInput.length < normalizedVariation.length ? normalizedVariation : normalizedInput;

    for (let i = 0; i < shorter.length; i++) {
      if (shorter[i] !== longer[i]) diffCount++;
    }

    return diffCount <= 2 && Math.abs(normalizedInput.length - normalizedVariation.length) <= 2;
  });

  return fuzzyMatch || null;
}

// Synchronous version for backward compatibility
function findBestMatchSync(input: string, variations: string[]): string | null {
  const normalizedInput = normalizeText(input);

  // Try exact match first
  const exactMatch = variations.find(v => normalizeText(v) === normalizedInput);
  if (exactMatch) return exactMatch;

  // Try contains match
  const containsMatch = variations.find(v => {
    const normalizedVariation = normalizeText(v);
    return normalizedInput.includes(normalizedVariation) ||
      normalizedVariation.includes(normalizedInput);
  });
  if (containsMatch) return containsMatch;

  // Try fuzzy match (allowing for small typos)
  const fuzzyMatch = variations.find(v => {
    const normalizedVariation = normalizeText(v);
    let diffCount = 0;
    const shorter = normalizedInput.length < normalizedVariation.length ? normalizedInput : normalizedVariation;
    const longer = normalizedInput.length < normalizedVariation.length ? normalizedVariation : normalizedInput;

    for (let i = 0; i < shorter.length; i++) {
      if (shorter[i] !== longer[i]) diffCount++;
    }

    return diffCount <= 2 && Math.abs(normalizedInput.length - normalizedVariation.length) <= 2;
  });

  return fuzzyMatch || null;
}

function parseQuantity(quantity: string): { value: number; unit: string } {
  quantity = quantity.toLowerCase().trim();
  let value = 0;
  let unit = 'əd';

  // Extract numeric value
  const numMatch = quantity.match(/[\d.,]+/);
  if (numMatch) {
    value = parseFloat(numMatch[0].replace(',', '.'));
  }

  // Determine unit
  if (quantity.includes('kq') || quantity.includes('kg')) {
    unit = 'kq';
  } else if (quantity.match(/(box|qutu)/i)) {
    unit = 'box';
  }

  return { value, unit };
}

export async function correctOrderText(inputText: string): Promise<string> {
  // Get latest corrections from Firebase
  const corrections = await getProductCorrections();
  
  // Split input into lines and filter empty lines
  const lines = inputText
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^[○•\-\s]*/, '')); // Remove bullet points and leading spaces

  // Process each line and aggregate quantities
  const orderItems = new Map<string, OrderItem>();

  for (const line of lines) {
    if (!line.trim()) continue;

    // Split the line into product name and quantity
    const parts = line.split(/[-–:]|\s{2,}/).map(part => part.trim());
    if (parts.length < 1) continue;

    const productPart = parts[0];
    const quantityPart = parts[parts.length - 1];

    // Find matching product
    let matchedProduct: ProductDefinition | undefined;

    for (const product of corrections) {
      const matchedVariation = await findBestMatch(productPart, [product.correct, ...product.variations]);
      if (matchedVariation) {
        matchedProduct = product;
        break;
      }
    }

    if (!matchedProduct) continue;

    // Parse quantity
    const { value, unit } = parseQuantity(quantityPart);

    // Aggregate quantities
    const existingItem = orderItems.get(matchedProduct.correct);
    if (existingItem) {
      if (existingItem.unit === unit) {
        existingItem.quantity += value;
      }
    } else {
      orderItems.set(matchedProduct.correct, {
        product: matchedProduct.correct,
        quantity: value,
        unit
      });
    }
  }

  // Convert aggregated items to formatted strings
  const correctedLines = Array.from(orderItems.values())
    .map(item => `${item.product} - ${item.quantity}${item.unit === 'əd' ? '' : ' ' + item.unit}`);

  return correctedLines.join('\n');
}

