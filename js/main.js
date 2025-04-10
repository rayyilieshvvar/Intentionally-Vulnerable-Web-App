document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    console.log('Application initialized with credentials:', localStorage.getItem('supabase_url'), localStorage.getItem('supabase_key'));
    
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Vulnerable URL parameter handling
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message) {
        // Directly insert user input into DOM
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = message; // Vulnerable to XSS
        document.body.prepend(messageDiv);
    }
});

// Function to show notification messages
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message; // Vulnerable to XSS
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Function to check if user is authenticated (simplified)
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Function to redirect to a page
function redirectTo(page) {
    window.location.href = page;
}

// Vulnerable function to execute SQL
async function executeQuery(query) {
    try {
        const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
        return { data, error };
    } catch (error) {
        console.error('Error executing query:', error);
        return { error };
    }
}