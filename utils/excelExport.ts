import * as XLSX from 'xlsx';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

interface BranchData {
  [branchName: string]: {
    [productName: string]: string | number;
  };
}

interface ProductPriceMap {
  get(name: string): number | undefined;
}

/**
 * Generates an Excel file with branch sheets and shares it
 */
export async function exportToExcel(
  ordersData: BranchData,
  productPrices: ProductPriceMap,
  date?: Date
): Promise<void> {
  try {
    const workbook = XLSX.utils.book_new();
    const reportDate = date || new Date();
    const dateStr = formatDateForFileName(reportDate);
    const branchNames = Object.keys(ordersData);

    // Create a sheet for each branch
    branchNames.forEach(branchName => {
      const branchProducts = ordersData[branchName];
      const tableData: (string | number)[][] = [];

      // Header row
      tableData.push(['N', 'Name', 'Quantity', 'Price', 'Total Price']);

      // Product rows
      let orderNumber = 1;
      let grandTotal = 0;

      Object.entries(branchProducts).forEach(([productName, quantity]) => {
        const qty = parseFloat(quantity as string);
        const price = productPrices.get(productName.trim().toLowerCase()) || 0;
        const totalPrice = qty * price;

        tableData.push([
          orderNumber,
          productName,
          qty,
          price,
          totalPrice.toFixed(2)
        ]);

        grandTotal += totalPrice;
        orderNumber++;
      });

      const productRowCount = Object.keys(branchProducts).length;

      // Add summary row
      tableData.push([]);
      tableData.push(['Total', '', '', '', grandTotal.toFixed(2)]);

      // Add sign-off section
      tableData.push([]);
      tableData.push([]);
      tableData.push(['Delivered by: _________________', 'Date: _________________']);
      tableData.push(['Accepted by: _________________', 'Date: _________________']);

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(tableData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },
        { wch: 30 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 }
      ];

      // Merge cells for Total row
      const totalRowIndex = productRowCount + 2;
      worksheet['!merges'] = [
        { s: { r: totalRowIndex, c: 0 }, e: { r: totalRowIndex, c: 3 } }
      ];

      // Add styling
      for (let col = 0; col <= 4; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'FFE5E5' } }
          };
        }
      }

      const totalCellAddress = XLSX.utils.encode_cell({ r: totalRowIndex, c: 0 });
      const totalValueCellAddress = XLSX.utils.encode_cell({ r: totalRowIndex, c: 4 });
      if (worksheet[totalCellAddress]) {
        worksheet[totalCellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'FFF4CC' } }
        };
      }
      if (worksheet[totalValueCellAddress]) {
        worksheet[totalValueCellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'FFF4CC' } }
        };
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(branchName));
    });

    // Generate binary as buffer
    const wbout = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const fileName = `AidasCorners_Orders_${dateStr}.xlsx`;

    // Web platform - download directly
    if (Platform.OS === 'web') {
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Native platform - use expo-file-system
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    // Convert buffer to base64
    const base64Data = bufferToBase64(wbout as ArrayBuffer);

    // Write file using FileSystem
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: 'base64',
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export Orders to Excel',
      });
    } else {
      console.error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

/**
 * Converts ArrayBuffer to Base64 string
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Formats date for filename (DD-MM-YYYY)
 */
function formatDateForFileName(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Sanitizes sheet name (Excel has 31 char limit)
 */
function sanitizeSheetName(name: string): string {
  let sanitized = name.replace(/[\\/?*[\]]/g, '');
  if (sanitized.length > 31) {
    sanitized = sanitized.substring(0, 31);
  }
  return sanitized || 'Sheet';
}
