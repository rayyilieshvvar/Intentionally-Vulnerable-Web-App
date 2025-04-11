// Use the existing supabaseClient from window instead of declaring a new one
document.addEventListener('DOMContentLoaded', function() {
    // Check if login form exists and add event listener
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Check if register form exists and add event listener
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Check if logout button exists and add event listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Function to handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    try {
        // Make sure we're using window.supabaseClient
        if (!window.supabaseClient) {
            throw new Error('Supabase client not initialized');
        }
        
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            if (errorMessage) {
                errorMessage.textContent = error.message;
            }
            console.error('Login error:', error.message);
            return;
        }
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        if (errorMessage) {
            errorMessage.textContent = 'An error occurred during login.';
        }
        console.error('Login error:', error);
    }
}

// Function to handle registration
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    try {
        // Use window.supabaseClient instead of supabaseClient
        const { data, error } = await window.supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    full_name: fullName
                }
            }
        });
        
        if (error) {
            if (errorMessage) {
                errorMessage.textContent = error.message;
            }
            console.error('Registration error:', error.message);
            return;
        }
        
        if (!data.user) {
            if (errorMessage) {
                errorMessage.textContent = 'Registration failed. Please try again.';
            }
            return;
        }
        
        // Create user profile in the profiles table - using supabaseClient instead of supabase
        const { error: profileError } = await window.supabaseClient
            .from('profiles')
            .insert([
                {
                    id: data.user.id,
                    username: username,
                    full_name: fullName,
                    email: email
                }
            ]);
        
        if (profileError) {
            console.error('Profile creation error:', profileError.message);
            // Continue anyway as the auth user was created
        }
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        if (errorMessage) {
            errorMessage.textContent = 'An error occurred during registration.';
        }
        console.error('Registration error:', error);
    }
}

// Function to handle logout
async function handleLogout(e) {
    e.preventDefault();
    
    try {
        // Use window.supabaseClient here
        await window.supabaseClient.auth.signOut();
        
        // Remove user data from localStorage
        localStorage.removeItem('user');
        
        // Redirect to home page
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Function to check if user is authenticated
async function checkAuthentication() {
    try {
        // Use window.supabaseClient here
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        // If no session and on a protected page, redirect to login
        if (!session && isProtectedPage()) {
            window.location.href = 'login.html';
            return false;
        }
        
        return !!session;
    } catch (error) {
        console.error('Authentication check error:', error);
        
        // Fallback to localStorage check
        const user = localStorage.getItem('user');
        
        if (!user && isProtectedPage()) {
            window.location.href = 'login.html';
            return false;
        }
        
        return !!user;
    }
}

// Function to determine if current page is protected
function isProtectedPage() {
    const publicPages = ['index.html', 'login.html', 'register.html', ''];
    const currentPage = window.location.pathname.split('/').pop();
    return !publicPages.includes(currentPage);
}

// Function to get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
}

// Add this function to your existing auth.js
async function forgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    
    if (!email) {
        showError('Please enter your email address');
        return;
    }
    
    try {
        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`,
        });
        
        if (error) {
            throw error;
        }
        
        // Show success message
        const errorDiv = document.getElementById('error-message');
        errorDiv.style.backgroundColor = '#4CAF50';
        errorDiv.style.color = 'white';
        errorDiv.textContent = 'Password reset link has been sent to your email';
        
    } catch (error) {
        showError(error.message);
    }
}

// Helper function to show errors (if not already present in your auth.js)
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.style.backgroundColor = '#f44336';
    errorDiv.style.color = 'white';
    errorDiv.textContent = message;
}