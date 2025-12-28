const XLSX = require('xlsx');
const path = require('path');

// Read the Excel file
const filePath = path.join(__dirname, '..', 'aidacorners_a_2025 giymet.xlsx');
const workbook = XLSX.readFile(filePath);

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Excel File Structure:');
console.log('======================');
console.log('Sheet Name:', sheetName);
console.log('Total Rows:', data.length);
console.log('\nFirst 20 rows:');
console.log(JSON.stringify(data.slice(0, 20), null, 2));

// Get headers from first row
if (data.length > 0) {
  console.log('\nHeaders:', data[0]);
}

// Get column names
if (data.length > 1) {
  console.log('\nSample data (second row):', data[1]);
}
