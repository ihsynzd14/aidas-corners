// src/utils/orderCorrection.ts

interface ProductDefinition {
  correct: string;
  variations: string[];
  units?: {
    type: 'weight' | 'piece' | 'box';
    variations: string[];
  };
}

export const PRODUCT_CORRECTIONS: ProductDefinition[] = [
  {
    correct: "Şokolad",
    variations: [
      "sokolad",
      "şokolad",
      "shokolad",
      "turk sokoladi",
      "turk sokolad",
      "türk şokolad",
      "turk kofe sokolad"
    ],
    units: {
      type: 'weight',
      variations: ['kq', 'kg', 'kilo', 'kiloqram']
    }
  },
  {
    correct: "Şokolad Lokumlu",
    variations: [
      "lokumlu sokolad",
      "lokum sokolad",
      "lokumlu şokolad",
      "sokolad lokum",
      "şokolad lokum"
    ],
    units: {
      type: 'weight',
      variations: ['kq', 'kg', 'kilo', 'kiloqram']
    }
  },
  {
    correct: "San sebastian",
    variations: [
      "san seba",
      "sab sebastian",
      "san sebastyan",
      "san sebastiyan",
      "san sebas",
      "san sabastian"
    ],
    units: {
      type: 'box',
      variations: ['box', 'qutu', 'ədəd']
    }
  },
  {
    correct: "Esterharzy",
    variations: [
      "esterxazy",
      "esterxayzer",
      "esterhazy",
      "esterharzi",
      "esterharzı",
      "asterharzy",
      "esterxazi"
    ]
  },
  {
    correct: "Magnolia çiyələkli",
    variations: [
      "maqnolia çiyələk",
      "magnolya ciyelek",
      "çiyələk magnolia",
      "maqnoliya ciyelek",
      "magnolia",
      "maqnoliya",
      "magnoliya ciyelek",
      "maqnolia"
    ]
  },
  {
    correct: "Dubai brownie",
    variations: [
      "dubai browni",
      "dubay browni",
      "dubai brownies",
      "dubay brownie",
      "dubai braunı",
      "dubay browny",
      "dubai brauni"
    ]
  },
  {
    correct: "Brownie",
    variations: [
      "browni",
      "brownies",
      "brauni",
      "braunı",
      "browny"
    ]
  },
  {
    correct: "Profiterol",
    variations: [
      "profitirol",
      "prafitirol",
      "profitrol",
      "prafitrol"
    ]
  },
  {
    correct: "Parfait orman meyvəli",
    variations: [
      "orman meyvəli parfeit",
      "orman meyve parifet",
      "orman meyvəli",
      "orman meyveli parfait",
      "parfait orman meyvəli",
      "parfait orman",
      "orman parfait"
    ]
  },
  {
    correct: "Parfait fıstıq əzməli ",
    variations: [
      "fıstıq əzməli parfeit",
      "yer fistiq parifet",
      "fıstıq əzməli",
      "parfait fıstıq əzməli",
      "parfait fistiq",
      "fistiqli parfait",
      "fistiq parfait"
    ]
  },
  {
    correct: "Çizkek Paxlavalı",
    variations: [
      "paxlavalı chees",
      "paxlavalı chescake",
      "çizkek paxlavalı",
      "paxlavalı cheesecake",
      "paxlava çizkek",
      "paxlava cheese",
      "paxlavali cheescake"
    ]
  },
  {
    correct: "Çizkek Fıstıqlı",
    variations: [
      "fistiqli cheesecake",
      "fıstıqlı çizkek",
      "çizkek fıstıqlı",
      "fıstıqlı cheesecake",
      "fıstıq çizkek",
      "fistiq cheese",
      "fıstıqlı cheese"
    ]
  },
  {
    correct: "Çizkek Karamelli",
    variations: [
      "karamel çizkek",
      "karamel cheesecake",
      "çizkek karamelli",
      "karamelli cheesecake",
      "karamel chescake",
      "karamel cheese",
      "karamelli cheese"
    ]
  },
  {
    correct: "Tiramisu",
    variations: [
      "tiramisu",
      "tiramizu",
      "tiramisu classic",
      "classic tiramisu",
      "tiramusi",
      "tiramisu klassik",
      "tiramiso"
    ]
  },
  {
    correct: "Red velvet",
    variations: [
      "red velvet",
      "red velved",
      "red velvett",
      "red walvet",
      "red valvet",
      "redvelvet",
      "red velvut"
    ]
  }
];

interface OrderItem {
  product: string;
  quantity: number;
  unit: string;
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

function findBestMatch(input: string, variations: string[]): string | null {
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

export function correctOrderText(inputText: string): string {
  // Split input into lines and filter empty lines
  const lines = inputText
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^[○•\-\s]*/, '')); // Remove bullet points and leading spaces

  // Process each line and aggregate quantities
  const orderItems = new Map<string, OrderItem>();

  lines.forEach(line => {
    if (!line.trim()) return;
    
    // Split the line into product name and quantity
    const parts = line.split(/[-–:]|\s{2,}/).map(part => part.trim());
    if (parts.length < 1) return;
    
    const productPart = parts[0];
    const quantityPart = parts[parts.length - 1];
    
    // Find matching product
    let matchedProduct: ProductDefinition | undefined;
    
    for (const product of PRODUCT_CORRECTIONS) {
      const matchedVariation = findBestMatch(productPart, [product.correct, ...product.variations]);
      if (matchedVariation) {
        matchedProduct = product;
        break;
      }
    }
    
    if (!matchedProduct) return;

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
  });

  // Convert aggregated items to formatted strings
  const correctedLines = Array.from(orderItems.values())
    .map(item => `${item.product} - ${item.quantity}${item.unit === 'əd' ? '' : ' ' + item.unit}`)
    .sort();

  return correctedLines.join('\n');
}