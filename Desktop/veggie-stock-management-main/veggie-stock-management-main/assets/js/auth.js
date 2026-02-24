/**
 * Authentication Module - VeggieTrack
 * Handles user signup/login, admin login, and session management
 */

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const onLoginPage = !!loginForm;

    // Only auto-redirect when we're on the login page
    if (onLoginPage && isLoggedIn()) {
        if (isAdmin()) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return;
    }

    // Only initialize login UI when the form exists
    if (onLoginPage) {
        initLoginForm();
        initSignupForm();
        initTabs();
    }
});

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Check if current session is admin
 */
function isAdmin() {
    return sessionStorage.getItem('isAdmin') === 'true';
}

/**
 * Initialize tab switching
 */
function initTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const panels = document.querySelectorAll('.auth-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            panels.forEach(p => {
                p.classList.remove('active');
                if (p.id === target + 'Panel') {
                    p.classList.add('active');
                }
            });
        });
    });
}

/**
 * Initialize login form
 */
function initLoginForm() {
    const form = document.getElementById('loginForm');
    const errorMessage = document.getElementById('loginError');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const loginBtn = document.getElementById('loginButton');

        // Hide any previous error
        if (errorMessage) errorMessage.classList.add('hidden');

        if (!username || !password) {
            showAuthError('loginError', 'Please enter both username and password.');
            return;
        }

        // Show loading
        loginBtn.disabled = true;
        loginBtn.textContent = 'Signing in...';

        await delay(800);

        // Check for admin login
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('isAdmin', 'true');
            sessionStorage.setItem('username', 'Admin');
            sessionStorage.setItem('loginTime', new Date().toISOString());

            loginBtn.textContent = '✓ Welcome, Admin!';
            loginBtn.style.background = '#16a34a';
            await delay(500);
            window.location.href = 'admin.html';
            return;
        }

        // Check user credentials
        if (window.DataManager && window.DataManager.validateUser(username, password)) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('isAdmin', 'false');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('loginTime', new Date().toISOString());

            loginBtn.textContent = '✓ Welcome!';
            loginBtn.style.background = '#16a34a';
            await delay(500);
            window.location.href = 'dashboard.html';
        } else {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In';
            showAuthError('loginError', 'Invalid username or password.');
        }
    });

    // Load remembered username
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('loginUsername').value = rememberedUser;
        const rememberCheckbox = document.getElementById('rememberMe');
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

/**
 * Initialize signup form
 */
function initSignupForm() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('signupUsername').value.trim();
        const password = document.getElementById('signupPassword').value.trim();
        const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();
        const signupBtn = document.getElementById('signupButton');

        if (!username || !password || !confirmPassword) {
            showAuthError('signupError', 'Please fill in all fields.');
            return;
        }

        if (username.toLowerCase() === 'admin') {
            showAuthError('signupError', 'This username is reserved.');
            return;
        }

        if (password.length < 4) {
            showAuthError('signupError', 'Password must be at least 4 characters.');
            return;
        }

        if (password !== confirmPassword) {
            showAuthError('signupError', 'Passwords do not match.');
            return;
        }

        signupBtn.disabled = true;
        signupBtn.textContent = 'Creating account...';

        await delay(800);

        const result = window.DataManager.registerUser(username, password);

        if (result.success) {
            signupBtn.textContent = '✓ Account Created!';
            signupBtn.style.background = '#16a34a';
            await delay(500);

            // Auto login
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('isAdmin', 'false');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('loginTime', new Date().toISOString());

            window.location.href = 'dashboard.html';
        } else {
            signupBtn.disabled = false;
            signupBtn.textContent = 'Create Account';
            showAuthError('signupError', result.message);
        }
    });
}

/**
 * Show error message
 */
function showAuthError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

/**
 * Utility: Delay promise
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Logout function (can be called from other pages)
 */
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('loginTime');
    window.location.href = 'index.html';
}

// Export for use in other pages
window.Auth = {
    isLoggedIn,
    isAdmin,
    logout,
    getUsername: () => sessionStorage.getItem('username')
};
