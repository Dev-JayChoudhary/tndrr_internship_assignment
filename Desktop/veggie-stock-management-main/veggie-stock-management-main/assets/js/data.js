/**
 * Data Management Module - Veggie Stock Management System
 * Handles vegetable inventory data with shelf-life tracking and multi-user support
 */

const DATA_KEY = 'veggie_stock_data';
const USERS_KEY = 'veggie_users';

// Initial vegetable products
const initialProducts = [
    {
        id: 1,
        name: 'Tomato',
        sku: 'VEG-TOM-001',
        category: 'Fruiting Vegetables',
        quantity: 120,
        safetyStock: 25,
        unitPrice: 2.49,
        shelfLifeDays: 7,
        dateAdded: getDateDaysAgo(2),
        salesHistory: generateSalesHistory(180, 8, 20)
    },
    {
        id: 2,
        name: 'Potato',
        sku: 'VEG-POT-002',
        category: 'Root Vegetables',
        quantity: 200,
        safetyStock: 40,
        unitPrice: 1.29,
        shelfLifeDays: 21,
        dateAdded: getDateDaysAgo(5),
        salesHistory: generateSalesHistory(180, 10, 25)
    },
    {
        id: 3,
        name: 'Onion',
        sku: 'VEG-ONI-003',
        category: 'Root Vegetables',
        quantity: 180,
        safetyStock: 30,
        unitPrice: 1.49,
        shelfLifeDays: 30,
        dateAdded: getDateDaysAgo(10),
        salesHistory: generateSalesHistory(180, 8, 18)
    },
    {
        id: 4,
        name: 'Carrot',
        sku: 'VEG-CAR-004',
        category: 'Root Vegetables',
        quantity: 90,
        safetyStock: 20,
        unitPrice: 1.99,
        shelfLifeDays: 14,
        dateAdded: getDateDaysAgo(3),
        salesHistory: generateSalesHistory(180, 5, 12)
    },
    {
        id: 5,
        name: 'Spinach',
        sku: 'VEG-SPN-005',
        category: 'Leafy Greens',
        quantity: 50,
        safetyStock: 15,
        unitPrice: 3.49,
        shelfLifeDays: 5,
        dateAdded: getDateDaysAgo(3),
        salesHistory: generateSalesHistory(180, 6, 14)
    },
    {
        id: 6,
        name: 'Capsicum',
        sku: 'VEG-CAP-006',
        category: 'Fruiting Vegetables',
        quantity: 8,
        safetyStock: 15,
        unitPrice: 3.99,
        shelfLifeDays: 7,
        dateAdded: getDateDaysAgo(5),
        salesHistory: generateSalesHistory(180, 4, 10)
    },
    {
        id: 7,
        name: 'Cabbage',
        sku: 'VEG-CAB-007',
        category: 'Cruciferous',
        quantity: 60,
        safetyStock: 12,
        unitPrice: 2.29,
        shelfLifeDays: 14,
        dateAdded: getDateDaysAgo(4),
        salesHistory: generateSalesHistory(180, 3, 8)
    },
    {
        id: 8,
        name: 'Cauliflower',
        sku: 'VEG-CLF-008',
        category: 'Cruciferous',
        quantity: 40,
        safetyStock: 10,
        unitPrice: 3.79,
        shelfLifeDays: 7,
        dateAdded: getDateDaysAgo(1),
        salesHistory: generateSalesHistory(180, 3, 7)
    },
    {
        id: 9,
        name: 'Broccoli',
        sku: 'VEG-BRC-009',
        category: 'Cruciferous',
        quantity: 5,
        safetyStock: 10,
        unitPrice: 4.49,
        shelfLifeDays: 5,
        dateAdded: getDateDaysAgo(4),
        salesHistory: generateSalesHistory(180, 2, 6)
    },
    {
        id: 10,
        name: 'Green Beans',
        sku: 'VEG-GBN-010',
        category: 'Fruiting Vegetables',
        quantity: 70,
        safetyStock: 18,
        unitPrice: 2.99,
        shelfLifeDays: 5,
        dateAdded: getDateDaysAgo(1),
        salesHistory: generateSalesHistory(180, 5, 12)
    }
];

/**
 * Get ISO date string for N days ago
 */
function getDateDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
}

/**
 * Calculate remaining shelf life days for a product
 */
function getShelfLifeRemaining(product) {
    if (!product.dateAdded || !product.shelfLifeDays) return null;
    const added = new Date(product.dateAdded);
    const expiryDate = new Date(added);
    expiryDate.setDate(expiryDate.getDate() + product.shelfLifeDays);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = expiryDate - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

/**
 * Generate random sales history for the past N days
 */
function generateSalesHistory(days, minSales, maxSales) {
    const history = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        history.push({
            date: date.toISOString().split('T')[0],
            sold: Math.floor(Math.random() * (maxSales - minSales + 1)) + minSales
        });
    }

    return history;
}

/**
 * Get storage key for current user
 */
function getUserDataKey() {
    const username = sessionStorage.getItem('username');
    if (!username) return DATA_KEY;
    return `veggie_stock_${username}`;
}

/**
 * Initialize data in localStorage if not exists
 */
function initializeData() {
    const key = getUserDataKey();
    const existingData = localStorage.getItem(key);

    if (!existingData) {
        const data = {
            products: initialProducts,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(data));
    }

    return getData();
}

/**
 * Get all data from localStorage
 */
function getData() {
    const key = getUserDataKey();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : { products: [], lastUpdated: null };
}

/**
 * Save data to localStorage
 */
function saveData(data) {
    const key = getUserDataKey();
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Get all products
 */
function getProducts() {
    return getData().products;
}

/**
 * Get product by ID
 */
function getProductById(id) {
    return getProducts().find(p => p.id === parseInt(id));
}

/**
 * Add new product
 */
function addProduct(product) {
    const data = getData();
    const maxId = data.products.length > 0
        ? Math.max(...data.products.map(p => p.id))
        : 0;

    const newProduct = {
        id: maxId + 1,
        ...product,
        dateAdded: product.dateAdded || new Date().toISOString().split('T')[0],
        shelfLifeDays: product.shelfLifeDays || 7,
        salesHistory: []
    };

    data.products.push(newProduct);
    saveData(data);

    return newProduct;
}

/**
 * Update existing product
 */
function updateProduct(id, updates) {
    const data = getData();
    const index = data.products.findIndex(p => p.id === parseInt(id));

    if (index !== -1) {
        data.products[index] = { ...data.products[index], ...updates };
        saveData(data);
        return data.products[index];
    }

    return null;
}

/**
 * Delete product
 */
function deleteProduct(id) {
    const data = getData();
    data.products = data.products.filter(p => p.id !== parseInt(id));
    saveData(data);
}

/**
 * Record a sale for a product
 */
function recordSale(productId, quantity) {
    const data = getData();
    const product = data.products.find(p => p.id === parseInt(productId));

    if (product && product.quantity >= quantity) {
        product.quantity -= quantity;

        const today = new Date().toISOString().split('T')[0];
        const todayEntry = product.salesHistory.find(h => h.date === today);

        if (todayEntry) {
            todayEntry.sold += quantity;
        } else {
            product.salesHistory.push({ date: today, sold: quantity });
        }

        saveData(data);
        return true;
    }

    return false;
}

/**
 * Reorder stock for a product
 */
function reorderStock(productId, quantity) {
    const data = getData();
    const product = data.products.find(p => p.id === parseInt(productId));

    if (product) {
        product.quantity += quantity;
        // Reset date added on reorder to refresh shelf life
        product.dateAdded = new Date().toISOString().split('T')[0];
        saveData(data);
        return true;
    }

    return false;
}

/**
 * Get low stock products
 */
function getLowStockProducts() {
    return getProducts().filter(p => p.quantity <= p.safetyStock);
}

/**
 * Get expiring soon products (<=3 days remaining)
 */
function getExpiringSoonProducts() {
    return getProducts().filter(p => {
        const remaining = getShelfLifeRemaining(p);
        return remaining !== null && remaining <= 3;
    });
}

/**
 * Get dashboard metrics
 */
function getDashboardMetrics() {
    const products = getProducts();

    const totalProducts = products.length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    const lowStockCount = products.filter(p => p.quantity <= p.safetyStock).length;
    const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
    const expiringSoonCount = products.filter(p => {
        const rem = getShelfLifeRemaining(p);
        return rem !== null && rem <= 3;
    }).length;

    // Calculate total sales this month
    const today = new Date();
    const thisMonth = today.toISOString().slice(0, 7);

    let totalSalesThisMonth = 0;
    let totalRevenueThisMonth = 0;

    products.forEach(product => {
        product.salesHistory.forEach(sale => {
            if (sale.date.startsWith(thisMonth)) {
                totalSalesThisMonth += sale.sold;
                totalRevenueThisMonth += sale.sold * product.unitPrice;
            }
        });
    });

    return {
        totalProducts,
        totalInventoryValue,
        lowStockCount,
        totalUnits,
        totalSalesThisMonth,
        totalRevenueThisMonth,
        expiringSoonCount
    };
}

/**
 * Get sales data for charts (last N days)
 */
function getSalesChartData(days = 30) {
    const products = getProducts();
    const labels = [];
    const salesData = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        let dailyTotal = 0;
        products.forEach(product => {
            const sale = product.salesHistory.find(s => s.date === dateStr);
            if (sale) {
                dailyTotal += sale.sold;
            }
        });

        salesData.push(dailyTotal);
    }

    return { labels, data: salesData };
}

/**
 * Get monthly inventory value history (fixed dummy data)
 * Uses fixed multipliers for a realistic, consistent trend.
 */
function getMonthlyInventoryValueHistory(months = 6) {
    const products = getProducts();
    const currentTotalValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

    // Fixed multipliers for each past month (oldest → newest)
    const fixedMultipliers = [1.12, 0.78, 1.05, 1.08, 0.95, 1.00];

    const labels = [];
    const data = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        labels.push(monthLabel);

        const idx = months - 1 - i; // 0 = oldest, 5 = current
        const multiplier = fixedMultipliers[idx] !== undefined ? fixedMultipliers[idx] : 1;
        data.push(Math.round(currentTotalValue * multiplier));
    }

    return { labels, data };
}

/**
 * Get inventory value over time (last N days) - DEPRECATED / Keeping for compatibility if needed, 
 * but changing export to point to new logic or just adding new export.
 * Actually, let's keep this but add the new one to exports.
 */
function getInventoryValueChartData(days = 30) {
    // ... (existing daily logic if needed, but we replace usage in dashboard)
    const products = getProducts();
    const labels = [];
    const valueData = [];
    const today = new Date();

    let currentValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        labels.unshift(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        valueData.unshift(currentValue);

        products.forEach(product => {
            // Simple reverse calculation (only subtracts sales, doesn't add restocks)
            // producing a "constant decline" look which user disliked.
            // We won't use this for the main chart anymore.
        });
    }
    return { labels, data: valueData };
}

/**
 * Get sales data for specific products (for comparison)
 */
function getProductSalesComparison(productIds, days = 30) {
    const products = getProducts().filter(p => productIds.includes(p.id));
    const labels = [];
    const datasets = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    const colors = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#06b6d4'];

    products.forEach((product, index) => {
        const data = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const sale = product.salesHistory.find(s => s.date === dateStr);
            data.push(sale ? sale.sold : 0);
        }

        datasets.push({
            label: product.name,
            data,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '33',
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 3
        });
    });

    return { labels, datasets };
}

/**
 * Reset data to initial state
 */
function resetData() {
    const key = getUserDataKey();
    localStorage.removeItem(key);
    return initializeData();
}

/**
 * Search products by name or SKU
 */
function searchProducts(query) {
    const lowerQuery = query.toLowerCase();
    return getProducts().filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Get unique categories
 */
function getCategories() {
    const products = getProducts();
    return [...new Set(products.map(p => p.category))];
}

/**
 * Get monthly sales totals for the last N months
 */
function getMonthlySalesData(months = 6) {
    const products = getProducts();
    const labels = [];
    const data = [];

    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7);
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        let monthlyTotal = 0;
        products.forEach(product => {
            product.salesHistory.forEach(sale => {
                if (sale.date.startsWith(monthKey)) {
                    monthlyTotal += sale.sold;
                }
            });
        });

        labels.push(monthLabel);
        data.push(monthlyTotal);
    }

    return { labels, data };
}

/**
 * Get top revenue generating products for current month
 */
function getTopRevenueProducts(count = 3) {
    const products = getProducts();
    const today = new Date();
    const thisMonth = today.toISOString().slice(0, 7);

    const productRevenues = products.map(product => {
        let monthlyRevenue = 0;
        let unitsSold = 0;
        product.salesHistory.forEach(sale => {
            if (sale.date.startsWith(thisMonth)) {
                unitsSold += sale.sold;
                monthlyRevenue += sale.sold * product.unitPrice;
            }
        });
        return {
            id: product.id,
            name: product.name,
            sku: product.sku,
            unitsSold,
            revenue: monthlyRevenue
        };
    });

    return productRevenues
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, count);
}

// ==================== MULTI-USER SUPPORT ====================

/**
 * Get all registered users
 */
function getUsers() {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Save users list
 */
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Register a new user
 */
function registerUser(username, password) {
    const users = getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Username already exists' };
    }
    users.push({
        username: username,
        password: password, // In production, use proper hashing
        createdAt: new Date().toISOString()
    });
    saveUsers(users);
    return { success: true };
}

/**
 * Validate user credentials
 */
function validateUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    return !!user;
}

/**
 * Get aggregated stats for admin dashboard (no personal data)
 */
function getAllUsersStats() {
    const users = getUsers();
    let totalInventoryItems = 0;
    let totalStockQuantity = 0;
    let totalShelfLifeRemaining = 0;
    let shelfLifeCount = 0;

    users.forEach(user => {
        const key = `veggie_stock_${user.username}`;
        const rawData = localStorage.getItem(key);
        if (rawData) {
            const data = JSON.parse(rawData);
            if (data.products) {
                totalInventoryItems += data.products.length;
                data.products.forEach(p => {
                    totalStockQuantity += p.quantity || 0;
                    const rem = getShelfLifeRemaining(p);
                    if (rem !== null) {
                        totalShelfLifeRemaining += rem;
                        shelfLifeCount++;
                    }
                });
            }
        }
    });

    return {
        totalUsers: users.length,
        totalInventoryItems,
        totalStockQuantity,
        avgShelfLifeRemaining: shelfLifeCount > 0 ? Math.round(totalShelfLifeRemaining / shelfLifeCount) : 0
    };
}

// Export functions for use in other modules
window.DataManager = {
    initializeData,
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    recordSale,
    reorderStock,
    getLowStockProducts,
    getExpiringSoonProducts,
    getDashboardMetrics,
    getSalesChartData,
    getSalesChartData,
    getInventoryValueChartData,
    getMonthlyInventoryValueHistory,
    getProductSalesComparison,
    getProductSalesComparison,
    getCategories,
    resetData,
    getMonthlySalesData,
    getTopRevenueProducts,
    getShelfLifeRemaining,
    // User management
    getUsers,
    registerUser,
    validateUser,
    getAllUsersStats
};
