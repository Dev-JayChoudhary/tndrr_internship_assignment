/**
 * Admin Dashboard Module - VeggieTrack
 * Displays aggregated platform statistics without personal data
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check admin authentication
    if (!window.Auth || !window.Auth.isLoggedIn() || !window.Auth.isAdmin()) {
        window.location.href = 'index.html';
        return;
    }

    loadAdminData();
    loadUserManagement();
    updateClock();
    setInterval(updateClock, 1000);
});

/**
 * Load admin dashboard data
 */
function loadAdminData() {
    const stats = DataManager.getAllUsersStats();

    // Animate KPI values
    animateValue('totalUsers', stats.totalUsers);
    animateValue('totalItems', stats.totalInventoryItems);
    animateValue('totalStock', stats.totalStockQuantity);
    animateValue('avgShelfLife', stats.avgShelfLifeRemaining);

    // Session time
    const loginTime = sessionStorage.getItem('loginTime');
    if (loginTime) {
        document.getElementById('sessionTime').textContent =
            new Date(loginTime).toLocaleString();
    }
}

/**
 * Load User Management Table
 */
function loadUserManagement() {
    const users = DataManager.getUsers();
    const tbody = document.getElementById('userTableBody');
    const noUsersMsg = document.getElementById('noUsersMessage');
    const table = document.getElementById('userTable');

    if (!tbody) return;

    if (users.length === 0) {
        if (noUsersMsg) noUsersMsg.classList.remove('hidden');
        if (table) table.style.display = 'none';
        return;
    }

    const plans = ['Free', 'Pro', 'Enterprise'];
    const planColors = {
        'Free': '#6b7280',
        'Pro': '#16a34a',
        'Enterprise': '#7c3aed'
    };

    tbody.innerHTML = users.map(user => {
        // Assign a plan based on username hash for consistency across reloads
        const hash = user.username.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const plan = plans[hash % 3];

        // Generate expiry date (30-365 days from registration)
        const regDate = new Date(user.createdAt || Date.now());
        const expiryDays = plan === 'Free' ? 0 : (hash % 336) + 30;
        const expiryDate = new Date(regDate);
        expiryDate.setDate(expiryDate.getDate() + expiryDays);

        const now = new Date();
        const isActive = plan === 'Free' || expiryDate > now;
        const statusClass = isActive ? 'status-active' : 'status-expired';
        const statusText = isActive ? 'Active' : 'Expired';
        const expiryDisplay = plan === 'Free'
            ? 'No expiry'
            : expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const registeredDate = regDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return `
            <tr>
                <td>
                    <div class="user-cell">
                        <div class="user-cell-avatar">${user.username.charAt(0).toUpperCase()}</div>
                        <span>${user.username}</span>
                    </div>
                </td>
                <td>
                    <span class="plan-badge" style="background: ${planColors[plan]}15; color: ${planColors[plan]}; border: 1px solid ${planColors[plan]}30;">
                        ${plan}
                    </span>
                </td>
                <td>${expiryDisplay}</td>
                <td><span class="status-dot ${statusClass}"></span> ${statusText}</td>
                <td>${registeredDate}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Animate number counting
 */
function animateValue(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(targetValue * easeOut);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Update clock
 */
function updateClock() {
    const el = document.getElementById('currentTime');
    if (el) {
        el.textContent = new Date().toLocaleString();
    }
}

/**
 * Logout
 */
function logout() {
    if (window.Auth) {
        window.Auth.logout();
    }
}
