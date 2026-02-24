/**
 * Inventory Module - VeggieTrack
 * Manages vegetable inventory with shelf-life tracking
 */

let currentReorderId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    DataManager.initializeData();
    setupUserInfo();
    populateCategories();
    loadProducts();
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function populateCategories() {
    const categories = DataManager.getCategories();
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    // Keep the first "All" option
    while (select.options.length > 1) select.remove(1);

    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

function loadProducts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    let products = DataManager.getProducts();

    if (search) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.sku.toLowerCase().includes(search)
        );
    }

    if (category) {
        products = products.filter(p => p.category === category);
    }

    renderProductsTable(products);
    loadLowStockItems();
}

function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-table">
                    <div class="empty-state">
                        <span style="font-size:2rem;">🥬</span>
                        <p>No vegetables found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(product => {
        const stockClass = getStockClass(product.quantity, product.safetyStock);
        const remaining = DataManager.getShelfLifeRemaining(product);
        const shelfClass = getShelfLifeClass(remaining);

        return `
            <tr data-id="${product.id}">
                <td>
                    <div class="product-cell">
                        <div class="product-icon">🥕</div>
                        <span class="product-name">${escapeHtml(product.name)}</span>
                    </div>
                </td>
                <td>${escapeHtml(product.sku)}</td>
                <td><span class="badge badge-info">${escapeHtml(product.category)}</span></td>
                <td><span class="stock-badge ${stockClass}">${product.quantity} kg</span></td>
                <td>${product.safetyStock} kg</td>
                <td>$${product.unitPrice.toFixed(2)}</td>
                <td>${product.shelfLifeDays || '-'} days</td>
                <td>
                    <span class="shelf-badge ${shelfClass}">
                        ${remaining !== null ? remaining + ' days' : '-'}
                    </span>
                </td>
                <td>
                    <div class="sold-input-group">
                        <input type="number" min="1" max="${product.quantity}" value="1"
                               class="form-input sold-input" id="sold-${product.id}">
                        <button class="btn btn-secondary sold-btn" onclick="recordSale(${product.id})"
                                ${product.quantity === 0 ? 'disabled' : ''}>
                            ✓
                        </button>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-ghost btn-icon" onclick="openEditModal(${product.id})" title="Edit">
                            ✏️
                        </button>
                        <button class="btn btn-ghost btn-icon" onclick="openReorderModal(${product.id})" title="Restock">
                            📦
                        </button>
                        <button class="btn btn-ghost btn-icon btn-danger-icon" onclick="deleteProduct(${product.id})" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getStockClass(quantity, safetyStock) {
    if (quantity <= 0) return 'stock-out';
    if (quantity <= safetyStock) return 'stock-low';
    return 'stock-ok';
}

function getShelfLifeClass(remaining) {
    if (remaining === null) return '';
    if (remaining <= 2) return 'shelf-expired';
    if (remaining <= 5) return 'shelf-warning';
    return 'shelf-fresh';
}

function loadLowStockItems() {
    const lowStockSection = document.getElementById('lowStockSection');
    const lowStockGrid = document.getElementById('lowStockGrid');
    const lowStockProducts = DataManager.getLowStockProducts();

    if (lowStockProducts.length === 0) {
        lowStockSection.style.display = 'none';
        return;
    }

    lowStockSection.style.display = 'block';
    lowStockGrid.innerHTML = lowStockProducts.map(product => `
        <div class="low-stock-card">
            <div class="low-stock-info">
                <strong>${escapeHtml(product.name)}</strong>
                <span>${product.quantity} kg / ${product.safetyStock} kg safety</span>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="openReorderModal(${product.id})">Restock</button>
        </div>
    `).join('');
}

// ========== ADD / EDIT MODAL ==========

function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add Vegetable';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productDateAdded').value = new Date().toISOString().split('T')[0];
    document.getElementById('saveButton').textContent = 'Add Vegetable';
    openModal('productModal');
}

function openEditModal(id) {
    const product = DataManager.getProductById(id);
    if (!product) return;

    document.getElementById('modalTitle').textContent = 'Edit Vegetable';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productSku').value = product.sku;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.unitPrice;
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productSafetyStock').value = product.safetyStock;
    document.getElementById('productShelfLife').value = product.shelfLifeDays || 7;
    document.getElementById('productDateAdded').value = product.dateAdded || '';
    document.getElementById('saveButton').textContent = 'Update Vegetable';
    openModal('productModal');
}

function saveProduct(event) {
    event.preventDefault();

    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value.trim(),
        sku: document.getElementById('productSku').value.trim(),
        category: document.getElementById('productCategory').value,
        unitPrice: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        safetyStock: parseInt(document.getElementById('productSafetyStock').value),
        shelfLifeDays: parseInt(document.getElementById('productShelfLife').value),
        dateAdded: document.getElementById('productDateAdded').value
    };

    if (productId) {
        DataManager.updateProduct(productId, productData);
        showToast('Vegetable updated successfully', 'success');
    } else {
        DataManager.addProduct(productData);
        showToast('Vegetable added successfully', 'success');
    }

    closeModal();
    populateCategories();
    loadProducts();
}

// ========== REORDER MODAL ==========

function openReorderModal(id) {
    const product = DataManager.getProductById(id);
    if (!product) return;

    currentReorderId = id;
    document.getElementById('reorderProductInfo').innerHTML = `
        <strong>${escapeHtml(product.name)}</strong>
        <span>Current Stock: ${product.quantity} kg | Safety: ${product.safetyStock} kg</span>
    `;
    document.getElementById('reorderQty').value = '';
    openModal('reorderModal');
}

function confirmReorder() {
    const qty = parseInt(document.getElementById('reorderQty').value);
    if (!qty || qty <= 0) {
        showToast('Please enter a valid quantity', 'error');
        return;
    }

    if (DataManager.reorderStock(currentReorderId, qty)) {
        showToast(`Restocked ${qty} kg successfully`, 'success');
        closeReorderModal();
        loadProducts();
    } else {
        showToast('Failed to restock', 'error');
    }
}

function closeReorderModal() {
    closeModal('reorderModal');
    currentReorderId = null;
}

// ========== SALES ==========

function recordSale(productId) {
    const input = document.getElementById(`sold-${productId}`);
    const qty = parseInt(input.value);

    if (!qty || qty <= 0) {
        showToast('Enter a valid quantity', 'error');
        return;
    }

    if (DataManager.recordSale(productId, qty)) {
        showToast(`Sold ${qty} kg`, 'success');
        loadProducts();
    } else {
        showToast('Insufficient stock', 'error');
    }
}

// ========== DELETE ==========

function deleteProduct(id) {
    const product = DataManager.getProductById(id);
    if (!product) return;

    if (confirm(`Delete "${product.name}" from inventory?`)) {
        DataManager.deleteProduct(id);
        showToast('Vegetable removed', 'success');
        populateCategories();
        loadProducts();
    }
}

// ========== MODAL UTILS ==========

function openModal(modalId) {
    const modal = document.getElementById(modalId || 'productModal');
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId || 'productModal');
    if (modal) modal.classList.remove('active');
}

// ========== TOAST ==========

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function logout() {
    if (window.Auth) window.Auth.logout();
}
