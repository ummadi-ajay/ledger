export const formatCurrency = (amount) => {
    return 'Rs. ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatNumber = (num) => {
    if (num >= 100000) return (num/100000).toFixed(1) + 'L';
    if (num >= 1000) return (num/1000).toFixed(1) + 'k';
    return num;
};

export const CATEGORIES = [
    'Consumables', 'Rent', 'Taxes', 'Furniture', 'Professional Fees', 
    'Direct Expenses', 'Temporary Receipt / Liability', 'Business Income', 
    'Travel Expense', 'Operating Expenses', 'Owner Capital', 'Vendor Refunds', 
    'Operating Income'
];

export const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result.map(field => field.trim().replace(/^"|"$/g, ''));
};
