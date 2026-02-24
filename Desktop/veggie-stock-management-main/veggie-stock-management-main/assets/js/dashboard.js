/**
 * Dashboard Module - VeggieTrack
 * Handles dashboard metrics and charts for vegetable stock
 */

let salesChart = null;
let inventoryChart = null;
let monthlySalesChart = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    DataManager.initializeData();
    setupUserInfo();
    loadDashboardData();
    initCharts();
});

function checkAuth() {
    if (!window.Auth || !window.Auth.isLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }
    // If admin, redirect to admin dashboard
    if (window.Auth.isAdmin()) {
        window.location.href = 'admin.html';
        return false;
    }
    return true;
}

function setupUserInfo() {
    const username = window.Auth.getUsername() || 'User';
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    if (userAvatar) userAvatar.textContent = username.charAt(0).toUpperCase();
    if (userName) userName.textContent = username;
}

function loadDashboardData() {
    const metrics = DataManager.getDashboardMetrics();
    const lowStockProducts = DataManager.getLowStockProducts();
    const categories = DataManager.getCategories();
    const products = DataManager.getProducts();

    animateNumber('totalProducts', metrics.totalProducts);
    animateNumber('inventoryValue', metrics.totalInventoryValue, { prefix: '$', decimals: 0 });
    animateNumber('lowStockCount', metrics.lowStockCount);
    animateNumber('expiringSoon', metrics.expiringSoonCount);

    animateNumber('totalUnits', metrics.totalUnits);
    animateNumber('monthlyRevenue', metrics.totalRevenueThisMonth, { prefix: '$', decimals: 0 });
    animateNumber('salesThisMonthUnits', metrics.totalSalesThisMonth);
    animateNumber('salesThisMonthRevenue', metrics.totalRevenueThisMonth, { prefix: '$', decimals: 0 });

    const avgPrice = products.length > 0
        ? products.reduce((sum, p) => sum + p.unitPrice, 0) / products.length
        : 0;
    animateNumber('avgPrice', avgPrice, { prefix: '$', decimals: 2 });

    document.getElementById('categoryCount').textContent = categories.length;
    updateLowStockList(lowStockProducts);
    updateTopRevenueProducts();
    document.getElementById('lastUpdated').textContent =
        `Last updated: ${new Date().toLocaleTimeString()}`;
}

function animateNumber(elementId, targetValue, options = {}) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const { prefix = '', suffix = '', decimals = 0, duration = 1000 } = options;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = targetValue * easeOutQuart;

        if (decimals > 0) {
            element.textContent = prefix + currentValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
        } else {
            element.textContent = prefix + Math.floor(currentValue).toLocaleString() + suffix;
        }

        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function updateLowStockList(products) {
    const container = document.getElementById('lowStockList');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>✅ All stock levels are healthy!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.slice(0, 5).map(product => `
        <div class="low-stock-item">
            <div class="low-stock-info">
                <span class="low-stock-name">${product.name}</span>
                <span class="low-stock-sku">${product.sku}</span>
            </div>
            <div class="low-stock-qty">
                <span class="qty-current">${product.quantity}</span>
                <span class="qty-divider">/</span>
                <span class="qty-safety">${product.safetyStock}</span>
            </div>
        </div>
    `).join('');
}

function updateTopRevenueProducts() {
    const container = document.getElementById('topRevenueProducts');
    if (!container) return;

    const topProducts = DataManager.getTopRevenueProducts(3);

    if (topProducts.length === 0 || topProducts.every(p => p.revenue === 0)) {
        container.innerHTML = `<div class="empty-state"><p>No sales recorded this month</p></div>`;
        return;
    }

    container.innerHTML = topProducts.map((product, index) => `
        <div class="top-product-item">
            <div class="top-product-rank">#${index + 1}</div>
            <div class="top-product-info">
                <span class="top-product-name">${product.name}</span>
                <span class="top-product-sku">${product.sku}</span>
            </div>
            <div class="top-product-stats">
                <span class="top-product-revenue">$${product.revenue.toLocaleString()}</span>
                <span class="top-product-units">${product.unitsSold} kg</span>
            </div>
        </div>
    `).join('');
}

function initCharts() {
    initSalesChart();
    initInventoryChart();
    initMonthlySalesChart();
}

function initSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    const salesData = DataManager.getSalesChartData(30);

    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: salesData.labels,
            datasets: [{
                label: 'Kg Sold',
                data: salesData.data,
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#111827',
                    bodyColor: '#4b5563',
                    borderColor: 'rgba(229, 231, 235, 1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#6b7280', font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#6b7280', font: { size: 11 } }
                }
            }
        }
    });
}

function initInventoryChart() {
    const ctx = document.getElementById('inventoryChart');
    if (!ctx) return;

    // Use monthly history instead of daily
    const inventoryData = DataManager.getMonthlyInventoryValueHistory(6);

    const trendBadge = document.getElementById('inventoryTrendBadge');
    if (trendBadge && inventoryData.data.length >= 2) {
        const current = inventoryData.data[inventoryData.data.length - 1];
        const previous = inventoryData.data[inventoryData.data.length - 2];
        const growing = current >= previous;

        trendBadge.textContent = growing ? 'Growing' : 'Declining';
        trendBadge.classList.remove('badge-success', 'badge-danger');
        trendBadge.classList.add(growing ? 'badge-success' : 'badge-danger');
    }

    inventoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: inventoryData.labels,
            datasets: [{
                label: 'Total Value',
                data: inventoryData.data,
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#22c55e',
                pointHoverBorderColor: '#f0fdf4',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#111827',
                    bodyColor: '#4b5563',
                    borderColor: 'rgba(229, 231, 235, 1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => '$' + context.raw.toLocaleString()
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#6b7280', font: { size: 10 } }
                },
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        color: '#6b7280',
                        font: { size: 11 },
                        callback: (value) => '$' + (value >= 1000 ? (value / 1000).toFixed(1) + 'K' : value)
                    }
                }
            },
            interaction: { intersect: false, mode: 'index' }
        }
    });
}

function initMonthlySalesChart() {
    const ctx = document.getElementById('monthlySalesChart');
    if (!ctx) return;
    const monthlyData = DataManager.getMonthlySalesData(6);

    monthlySalesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Kg Sold',
                data: monthlyData.data,
                borderColor: '#4ade80',
                backgroundColor: 'rgba(74, 222, 128, 0.15)',
                borderWidth: 2,
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointBackgroundColor: '#4ade80',
                pointBorderColor: '#f0fdf4',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#111827',
                    bodyColor: '#4b5563',
                    padding: 12,
                    borderColor: 'rgba(229, 231, 235, 1)',
                    borderWidth: 1,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#6b7280', font: { size: 10 } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#6b7280', font: { size: 11 } }
                }
            }
        }
    });
}

function refreshData() {
    loadDashboardData();
    if (salesChart) salesChart.destroy();
    if (inventoryChart) inventoryChart.destroy();
    if (monthlySalesChart) monthlySalesChart.destroy();
    initCharts();
}

function logout() {
    if (window.Auth) window.Auth.logout();
}
