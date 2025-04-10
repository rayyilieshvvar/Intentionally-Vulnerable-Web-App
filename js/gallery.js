document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authenticated
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
        return;
    }
    
    // Get current user
    const user = getCurrentUser();
    
    // Check if we're on the gallery page
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid) {
        // Load user's images
        loadUserImages(user.id);
        
        // Set up upload form
        const uploadForm = document.getElementById('upload-form');
        if (uploadForm) {
            uploadForm.addEventListener('submit', function(e) {
                e.preventDefault();
                uploadImage(user.id);
            });
        }
    }
});

// Function to load user's images
async function loadUserImages(userId) {
    const galleryGrid = document.getElementById('gallery-grid');
    const loadingMessage = document.getElementById('loading-message');
    
    try {
        // Fetch user's images from Supabase
        const { data: images, error } = await window.supabaseClient
            .from('images')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) {
            throw error;
        }
        
        // Clear loading message
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        // Display images
        if (images && images.length > 0) {
            images.forEach(image => {
                const imageElement = createImageElement(image);
                galleryGrid.appendChild(imageElement);
            });
        } else {
            galleryGrid.innerHTML = '<p>No images found. Upload your first image!</p>';
        }
        
    } catch (error) {
        console.error('Error loading images:', error);
        galleryGrid.innerHTML = '<p>Error loading images. Please try again later.</p>';
    }
}

// Function to create image element
function createImageElement(image) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-item';
    imageContainer.dataset.id = image.id;
    
    // Vulnerable to XSS - directly inserting user input
    imageContainer.innerHTML = `
        <img src="${image.url}" alt="${image.title}">
        <div class="image-title">${image.title}</div>
        <div class="image-actions">
            <button class="delete-btn" onclick="deleteImage('${image.id}')">Delete</button>
        </div>
    `;
    
    return imageContainer;
}

// Function to upload image
async function uploadImage(userId) {
    const titleInput = document.getElementById('image-title');
    const fileInput = document.getElementById('image-file');
    
    if (!titleInput || !fileInput || !fileInput.files || fileInput.files.length === 0) {
        showNotification('Please select an image and provide a title.', 'error');
        return;
    }
    
    const title = titleInput.value;
    const file = fileInput.files[0];
    
    try {
        // Show loading notification
        showNotification('Uploading image...', 'info');
        
        // First check if the user session is valid
        const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();
        
        if (sessionError || !session) {
            throw new Error('Authentication error. Please log in again.');
        }
        
        // Upload file to Supabase Storage
        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
            .from('gallery-images')
            .upload(`${userId}/${fileName}`, file);
        
        if (uploadError) {
            throw uploadError;
        }
        
        // Get public URL for the uploaded file
        const { data } = window.supabaseClient.storage
            .from('gallery-images')
            .getPublicUrl(`${userId}/${fileName}`);
        
        const publicUrl = data.publicUrl;
        
        // Save image metadata to database with explicit user_id
        const { data: imageData, error: imageError } = await window.supabaseClient
            .from('images')
            .insert([
                {
                    user_id: userId,
                    title: title,
                    url: publicUrl,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (imageError) {
            console.error('Database insertion error:', imageError);
            throw imageError;
        }
        
        // Show success notification
        showNotification('Image uploaded successfully!', 'success');
        
        // Reset form
        titleInput.value = '';
        fileInput.value = '';
        
        // Reload images
        const galleryGrid = document.getElementById('gallery-grid');
        galleryGrid.innerHTML = '<p id="loading-message">Loading your images...</p>';
        loadUserImages(userId);
        
    } catch (error) {
        console.error('Error uploading image:', error);
        showNotification('Error uploading image. Please try again.', 'error');
    }
}

// Function to delete image
async function deleteImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }
    
    try {
        // Delete image from database - using window.supabaseClient instead of supabase
        const { error } = await window.supabaseClient
            .from('images')
            .delete()
            .eq('id', imageId);
        
        if (error) {
            throw error;
        }
        
        // Remove image element from DOM
        const imageElement = document.querySelector(`.image-item[data-id="${imageId}"]`);
        if (imageElement) {
            imageElement.remove();
        }
        
        // Show success notification
        showNotification('Image deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting image:', error);
        showNotification('Error deleting image. Please try again.', 'error');
    }
}