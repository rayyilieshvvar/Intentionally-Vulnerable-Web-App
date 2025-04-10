document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authenticated
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
        return;
    }
    
    // Get current user
    const user = getCurrentUser();
    
    // Check if we're on the profile page
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        // Load user profile
        loadUserProfile(user.id);
        
        // Set up profile form
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile(user.id);
        });
        
        // Set up avatar upload
        const avatarFile = document.getElementById('avatar-file');
        if (avatarFile) {
            avatarFile.addEventListener('change', function(e) {
                uploadAvatar(user.id, e.target.files[0]);
            });
        }
        
        // Set up password form
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                changePassword();
            });
        }
        
        // Set up delete account button
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', function() {
                deleteAccount(user.id);
            });
        }
    }
});

// Function to load user profile
async function loadUserProfile(userId) {
    let profileContainer = document.getElementById('profile-container');
    const loadingMessage = document.getElementById('loading-message');
    
    // Create profile container if it doesn't exist
    if (!profileContainer) {
        console.log('Creating profile container element');
        profileContainer = document.createElement('div');
        profileContainer.id = 'profile-container';
        
        // Find a suitable parent element to append to
        const profileForm = document.getElementById('profile-form');
        if (profileForm && profileForm.parentNode) {
            profileForm.parentNode.insertBefore(profileContainer, profileForm);
        } else {
            // Fallback - append to body
            document.body.appendChild(profileContainer);
        }
    }
    
    try {
        // Fetch user profile from database
        const { data: profiles, error } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .limit(1);
        
        if (error) {
            throw error;
        }
        
        // Clear loading message
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        // Display profile information
        if (profiles && profiles.length > 0) {
            const profile = profiles[0];
            
            // Check if form elements exist before setting values
            if (document.getElementById('username')) {
                document.getElementById('username').value = profile.username || '';
            }
            
            if (document.getElementById('full-name')) {
                document.getElementById('full-name').value = profile.full_name || '';
            }
            
            if (document.getElementById('email')) {
                document.getElementById('email').value = profile.email || '';
            }
            
            // Set avatar preview
            const avatarPreview = document.getElementById('avatar-preview');
            if (avatarPreview && profile.avatar_url) {
                avatarPreview.src = profile.avatar_url;
            }
        } else {
            profileContainer.innerHTML = '<p>Profile not found. Please create your profile.</p>';
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
        profileContainer.innerHTML = '<p>Error loading profile. Please try again later.</p>';
    }
}

// Function to update profile
async function updateProfile(userId) {
    const username = document.getElementById('username').value;
    const fullName = document.getElementById('full-name').value;
    // Remove bio and website if they don't exist in your database
    
    if (!username || !fullName) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    try {
        // Show loading notification
        showNotification('Updating profile...', 'info');
        
        // Update profile in database - only include fields that exist in your table
        const { error } = await window.supabaseClient
            .from('profiles')
            .update({
                username: username,
                full_name: fullName
                // bio and website fields removed since they don't exist in your database
            })
            .eq('id', userId);
        
        if (error) {
            throw error;
        }
        
        // Show success notification
        showNotification('Profile updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile. Please try again.', 'error');
    }
}

// Function to upload avatar
async function uploadAvatar(userId, file) {
    if (!file) {
        return;
    }
    
    try {
        // Show loading notification
        showNotification('Uploading avatar...', 'info');
        
        // Get current session
        const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
        if (authError || !user) {
            throw new Error('Authentication required');
        }
        
        const bucketName = 'avatars';
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
            .from(bucketName)
            .upload(filePath, file, {
                upsert: true,
                contentType: file.type
            });
        
        if (uploadError) {
            throw uploadError;
        }
        
        // Get public URL for the uploaded file
        const { data: urlData } = await window.supabaseClient.storage
            .from(bucketName)
            .createSignedUrl(filePath, 31536000); // URL valid for 1 year
        
        // Update profile with new avatar URL
        const { error: updateError } = await window.supabaseClient
            .from('profiles')
            .update({
                avatar_url: urlData.signedUrl
            })
            .eq('id', userId)
            .eq('id', user.id); // Additional check to ensure user owns the profile
        
        if (updateError) {
            throw updateError;
        }
        
        // Update avatar preview
        const avatarPreview = document.getElementById('avatar-preview');
        if (avatarPreview) {
            avatarPreview.src = urlData.signedUrl;
        }
        
        showNotification('Avatar updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error uploading avatar:', error);
        showNotification(`Error uploading avatar: ${error.message}`, 'error');
    }
}

// Function to change password
async function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all password fields.', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match.', 'error');
        return;
    }
    
    try {
        // Show loading notification
        showNotification('Changing password...', 'info');
        
        // Vulnerable implementation - no proper validation or secure password handling
        const { error } = await window.supabaseClient.auth.updateUser({
            password: newPassword
        });
        
        if (error) {
            throw error;
        }
        
        // Reset form
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        // Show success notification
        showNotification('Password changed successfully!', 'success');
        
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Error changing password. Please try again.', 'error');
    }
}

// Function to delete account
async function deleteAccount(userId) {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }
    
    try {
        // Show loading notification
        showNotification('Deleting account...', 'info');
        
        // Delete user's images
        const { error: imagesError } = await window.supabaseClient
            .from('images')
            .delete()
            .eq('user_id', userId);
        
        if (imagesError) {
            console.error('Error deleting images:', imagesError);
        }
        
        // Delete user's posts
        const { error: postsError } = await window.supabaseClient
            .from('posts')
            .delete()
            .eq('user_id', userId);
        
        if (postsError) {
            console.error('Error deleting posts:', postsError);
        }
        
        // Delete user's profile
        const { error: profileError } = await window.supabaseClient
            .from('profiles')
            .delete()
            .eq('id', userId);
        
        if (profileError) {
            console.error('Error deleting profile:', profileError);
        }
        
        // Instead of trying to delete the user account directly,
        // we'll sign out and instruct the user to contact support
        await window.supabaseClient.auth.signOut();
        
        // Clear user data from localStorage
        localStorage.removeItem('user');
        
        // Show a message to the user
        alert('Your account data has been deleted. Please contact support to completely remove your account from the system.');
        
        // Redirect to home page
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Error deleting account:', error);
        showNotification('Error deleting account. Please try again.', 'error');
    }
}