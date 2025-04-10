document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reset-password-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        try {
            const { error } = await window.supabaseClient.auth.updateUser({
                password: newPassword
            });
            
            if (error) {
                throw error;
            }
            
            // Show success message and redirect
            showSuccess('Password updated successfully. Redirecting to login...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            showError(error.message);
        }
    });
});

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.style.backgroundColor = '#f44336';
    errorDiv.style.color = 'white';
    errorDiv.textContent = message;
}

function showSuccess(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.style.backgroundColor = '#4CAF50';
    errorDiv.style.color = 'white';
    errorDiv.textContent = message;
}