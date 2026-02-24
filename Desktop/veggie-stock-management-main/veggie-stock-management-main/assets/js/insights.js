/**
 * Insights Module - VeggieTrack
 * Product comparison and analytics
 */

let comparisonChart = null;
let selectedProductIds = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    DataManager.initializeData();
    setupUserInfo();
    loadProductList();
});

function checkAuth() {
    if (!window.Auth || !window.Auth.isLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }
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

function loadProductList() {
    const products = DataManager.getProducts();
    renderProductGrid(products);
}

function filterProductList() {
    const search = document.getElementById('productSearch').value.toLowerCase();
    let products = DataManager.getProducts();
    if (search) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.sku.toLowerCase().includes(search)
        );
    }
    renderProductGrid(products);
}

function renderProductGrid(products) {
    const grid = document.getElementById('productSelectionGrid');
    if (!grid) return;

    grid.innerHTML = products.map(product => {
        const isSelected = selectedProductIds.includes(product.id);
        const remaining = DataManager.getShelfLifeRemaining(product);

        return `
            <div class="product-select-card ${isSelected ? 'selected' : ''}" 
                 onclick="toggleProduct(${product.id})" data-id="${product.id}">
                <div class="product-select-check">${isSelected ? '✅' : '⬜'}</div>
                <div class="product-select-info">
                    <span class="product-select-name">🥕 ${product.name}</span>
                    <span class="product-select-sku">${product.sku}</span>
                </div>
                <div class="product-select-meta">
                    <span class="product-select-stock">${product.quantity} kg</span>
                    ${remaining !== null ? `<span class="product-select-shelf">${remaining}d left</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function toggleProduct(productId) {
    const index = selectedProductIds.indexOf(productId);
    if (index === -1) {
        if (selectedProductIds.length >= 5) {
            alert('Maximum 5 vegetables for comparison');
            return;
        }
        selectedProductIds.push(productId);
    } else {
        selectedProductIds.splice(index, 1);
    }

    document.getElementById('selectedCount').textContent =
        selectedProductIds.length + ' selected';

    filterProductList();
    updateComparison();
    updateProductStats();
}

function updateComparison() {
    const section = document.getElementById('comparisonSection');

    if (selectedProductIds.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    const chartData = DataManager.getProductSalesComparison(selectedProductIds, 30);

    if (comparisonChart) comparisonChart.destroy();

    const ctx = document.getElementById('comparisonChart');
    comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: chartData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#374151',
                        font: { size: 11, family: 'Inter' },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#111827',
                    bodyColor: '#4b5563',
                    borderColor: 'rgba(229, 231, 235, 1)',
                    borderWidth: 1,
                    padding: 12
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
                    ticks: { color: '#6b7280', font: { size: 11 } },
                    title: {
                        display: true,
                        text: 'Kg Sold',
                        color: '#6b7280',
                        font: { size: 12 }
                    }
                }
            },
            interaction: { intersect: false, mode: 'index' }
        }
    });
}

function updateProductStats() {
    const grid = document.getElementById('productStatsGrid');
    if (!grid) return;

    if (selectedProductIds.length === 0) {
        grid.innerHTML = '';
        return;
    }

    const products = DataManager.getProducts().filter(p => selectedProductIds.includes(p.id));
    const today = new Date();
    const thisMonth = today.toISOString().slice(0, 7);

    grid.innerHTML = products.map(product => {
        const remaining = DataManager.getShelfLifeRemaining(product);
        let monthlySales = 0;
        let monthlyRevenue = 0;
        product.salesHistory.forEach(sale => {
            if (sale.date.startsWith(thisMonth)) {
                monthlySales += sale.sold;
                monthlyRevenue += sale.sold * product.unitPrice;
            }
        });

        const shelfClass = remaining === null ? '' : remaining <= 2 ? 'text-danger' : remaining <= 5 ? 'text-warning' : 'text-success';

        return `
            <div class="card stat-card">
                <h4 class="stat-card-name">🥕 ${product.name}</h4>
                <div class="stat-card-grid">
                    <div class="stat-mini">
                        <span class="stat-mini-label">Stock</span>
                        <span class="stat-mini-value">${product.quantity} kg</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-mini-label">Price/kg</span>
                        <span class="stat-mini-value">$${product.unitPrice.toFixed(2)}</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-mini-label">Monthly Sales</span>
                        <span class="stat-mini-value">${monthlySales} kg</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-mini-label">Monthly Revenue</span>
                        <span class="stat-mini-value text-success">$${monthlyRevenue.toFixed(0)}</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-mini-label">Shelf Life</span>
                        <span class="stat-mini-value">${product.shelfLifeDays || '-'} days</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-mini-label">Remaining</span>
                        <span class="stat-mini-value ${shelfClass}">${remaining !== null ? remaining + ' days' : '-'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function logout() {
    if (window.Auth) window.Auth.logout();
}
