const AUTH_TOKEN_KEY = 'auth_token'
const DOMAIN = 'learn.zone01oujda.ma'
const AUTH_ENDPOINT = `https://${DOMAIN}/api/auth/signin`;

function checkAuth() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = '/index.html'
        }
        return false
    }
    if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
        window.location.href = '/profile.html'
    }
    return true
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    const loginForm = document.getElementById('login-form')
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = document.getElementById('identifier').value
            const password = document.getElementById('password').value
            const errorMessage = document.getElementById('error-message');

            try {
                await login(identifier, password);
                window.location.href = '/profile.html';
            } catch (error) {
                errorMessage.textContent = error.message || 'Login failed. Please check your credentials.';
            }
        })
    }

    const logoutBtn = document.getElementById('logout-btn')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout()
            window.location.href = '/index.html'
        })
    }
})

async function login(identifier, password) {
    // converted to base64 because HTTP headers can only contain certain chars
    // convert binary data into ASCII text format
    const credentials = btoa(`${identifier}:${password}`)
    try {
        const response = await fetch(AUTH_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            },
        })

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const token = await response.json();

        localStorage.setItem(AUTH_TOKEN_KEY, token)

        return token
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
}
