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
      correct: "Türk qəhvəli şokolad",
      variations: [
        "türk kofesi şokalad",
        "turk sokoladi",
        "türk kofesi şokolad",
        "turk sokolad",
        "turk kofe sokolad",
        "türk qehveli şokolad"
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
        "kavonozda magnolia",
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
      correct: "Orman meyvəli parfait",
      variations: [
        "orman meyvəli parfeit",
        "orman meyve parifet",
        "orman meyvəli",
        "orman meyveli parfait",
        "orman meyvəli parfet",
        "meşə meyvəli",
        "orman meyveli"
      ]
    },
    {
      correct: "Fıstıq əzməli parfait",
      variations: [
        "fıstıq əzməli parfeit",
        "yer fistiq parifet",
        "fıstıq əzməli",
        "fistiq ezmeli parfait",
        "fıstıq parf",
        "fistiqli parfait",
        "yer fıstığı parfait"
      ]
    },
    {
      correct: "Paxlavalı çizkek",
      variations: [
        "paxlavalı chees",
        "paxlavalı chescake",
        "paxlaca ciz",
        "paxlavalı cheesecake",
        "paxlava çizkek",
        "paxlava cheese",
        "paxlavali cheescake"
      ],
      units: {
        type: 'box',
        variations: ['box', 'qutu', 'ədəd']
      }
    },
    {
      correct: "Fıstıqlı çizkek",
      variations: [
        "fistiqli cheesecake",
        "fıstıqlı çizkek",
        "fistiqli chescake",
        "fıstıqlı cheesecake",
        "fıstıq çizkek",
        "fistiq cheese",
        "fıstıqlı cheese"
      ]
    },
    {
      correct: "Karamelli çizkek",
      variations: [
        "karamel çizkek",
        "karamel cheesecake",
        "karamelli cheesecake",
        "karamel chescake",
        "karamel cheese",
        "karamelli cheese",
        "karamel ciz"
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
      
      // Allow for 2 character differences plus length difference up to 2
      return diffCount <= 2 && Math.abs(normalizedInput.length - normalizedVariation.length) <= 2;
    });
    
    return fuzzyMatch || null;
  }
  
  function normalizeQuantity(quantity: string): string {
    quantity = quantity.toLowerCase().trim();
    
    // Handle weight units
    if (quantity.includes('kq') || quantity.includes('kg')) {
      return quantity
        .replace(',', '.')
        .replace(/kq|kg/, 'kq')
        .replace(/\s+/g, '');
    }
    
    // Handle piece units
    if (quantity.match(/(eded|əd|ədəd|ed)/)) {
      const number = quantity.match(/\d+\.?\d*/)?.[0] || '';
      return `${number} əd`;
    }
    
    // Handle box units
    if (quantity.match(/(box|qutu)/i)) {
      const number = quantity.match(/\d+\.?\d*/)?.[0] || '';
      return `${number} box`;
    }
    
    // If just a number, assume it's pieces
    if (quantity.match(/^\d+\.?\d*$/)) {
      return `${quantity} əd`;
    }
    
    return quantity;
  }
  
  export function correctOrderText(inputText: string): string {
    // Split input into lines and filter empty lines
    const lines = inputText
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[○•\-\s]*/, '')); // Remove bullet points and leading spaces
    
    const correctedLines = lines.map(line => {
      if (!line.trim()) return '';
      
      // Split the line into product name and quantity
      // Handle various separators: -, –, :, multiple spaces
      const parts = line.split(/[-–:]|\s{2,}/).map(part => part.trim());
      if (parts.length < 1) return line;
      
      const productPart = parts[0];
      const quantityPart = parts[parts.length - 1];
      
      // Find matching product
      let matchedProduct: ProductDefinition | undefined;
      let matchedVariation: string | null = null;
      
      for (const product of PRODUCT_CORRECTIONS) {
        matchedVariation = findBestMatch(productPart, [product.correct, ...product.variations]);
        if (matchedVariation) {
          matchedProduct = product;
          break;
        }
      }
      
      if (!matchedProduct) return line;
      
      // Normalize quantity if present
      let quantity = '';
      if (quantityPart) {
        // Check if quantity part actually contains a number
        if (quantityPart.match(/\d/)) {
          quantity = normalizeQuantity(quantityPart);
        } else {
          // If no number in the last part, try to find quantity in the full line
          const numberMatch = line.match(/\d+\.?\d*\s*(?:eded|əd|ədəd|ed|box|qutu|kq|kg)/i);
          if (numberMatch) {
            quantity = normalizeQuantity(numberMatch[0]);
          }
        }
      }
      
      return `${matchedProduct.correct}${quantity ? ' - ' + quantity : ''}`;
    });
    
    return correctedLines.join('\n');
  }