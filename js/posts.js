document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authenticated
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
        return;
    }
    
    // Get current user
    const user = getCurrentUser();
    
    // Check if we're on the posts page
    const postsList = document.getElementById('posts-list');
    if (postsList) {
        // Load user's posts
        loadUserPosts(user.id);
        
        // Set up post form
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', function(e) {
                e.preventDefault();
                createPost(user.id);
            });
        }
    }
});

// Function to load user's posts
async function loadUserPosts(userId) {
    const postsList = document.getElementById('posts-list');
    const loadingMessage = document.getElementById('loading-message');
    
    try {
        // Fetch user's posts from Supabase
        const { data: posts, error } = await window.supabaseClient
            .from('posts')
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
        
        // Display posts
        if (posts && posts.length > 0) {
            posts.forEach(post => {
                const postElement = createPostElement(post);
                postsList.appendChild(postElement);
            });
        } else {
            postsList.innerHTML = '<p>No posts found. Create your first post!</p>';
        }
        
    } catch (error) {
        console.error('Error loading posts:', error);
        postsList.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    }
}

// Function to create post element
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post-item';
    postElement.dataset.id = post.id;
    
    // Format date
    const createdAt = new Date(post.created_at);
    const formattedDate = createdAt.toLocaleDateString() + ' ' + createdAt.toLocaleTimeString();
    
    // Vulnerable to XSS - directly inserting user input
    postElement.innerHTML = `
        <div class="post-content">${post.content}</div>
        <div class="post-meta">Posted on ${formattedDate}</div>
        <div class="post-actions">
            <button class="edit-btn" onclick="editPost('${post.id}')">Edit</button>
            <button class="delete-btn" onclick="deletePost('${post.id}')">Delete</button>
        </div>
    `;
    
    return postElement;
}

// Function to create post
async function createPost(userId) {
    const contentInput = document.getElementById('post-content');
    
    if (!contentInput || !contentInput.value.trim()) {
        showNotification('Please enter post content.', 'error');
        return;
    }
    
    const content = contentInput.value;
    
    try {
        // Show loading notification
        showNotification('Creating post...', 'info');
        
        // Save post to database
        const { data: postData, error } = await window.supabaseClient
            .from('posts')
            .insert([
                {
                    user_id: userId,
                    content: content,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (error) {
            throw error;
        }
        
        // Show success notification
        showNotification('Post created successfully!', 'success');
        
        // Reset form
        contentInput.value = '';
        
        // Reload posts
        const postsList = document.getElementById('posts-list');
        postsList.innerHTML = '<p id="loading-message">Loading your posts...</p>';
        loadUserPosts(userId);
        
    } catch (error) {
        console.error('Error creating post:', error);
        showNotification('Error creating post. Please try again.', 'error');
    }
}

// Function to edit post
async function editPost(postId) {
    try {
        // Fetch post data
        const { data: post, error } = await window.supabaseClient
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();
        
        if (error) {
            throw error;
        }
        
        // Get post element
        const postElement = document.querySelector(`.post-item[data-id="${postId}"]`);
        if (!postElement) {
            return;
        }
        
        // Replace post content with edit form
        const originalContent = postElement.querySelector('.post-content').innerHTML;
        const postContent = document.createElement('div');
        postContent.className = 'edit-post-form';
        
        // Vulnerable to XSS - directly inserting user input
        postContent.innerHTML = `
            <div class="form-group">
                <textarea id="edit-content-${postId}" rows="4">${post.content}</textarea>
            </div>
            <div class="edit-actions">
                <button class="btn primary" onclick="updatePost('${postId}')">Save</button>
                <button class="btn secondary" onclick="cancelEdit('${postId}', '${originalContent.replace(/'/g, "\\'")}')">Cancel</button>
            </div>
        `;
        
        postElement.querySelector('.post-content').replaceWith(postContent);
        postElement.querySelector('.post-actions').style.display = 'none';
        
    } catch (error) {
        console.error('Error editing post:', error);
        showNotification('Error editing post. Please try again.', 'error');
    }
}

// Function to update post
async function updatePost(postId) {
    const contentInput = document.getElementById(`edit-content-${postId}`);
    
    if (!contentInput || !contentInput.value.trim()) {
        showNotification('Please enter post content.', 'error');
        return;
    }
    
    const content = contentInput.value;
    
    try {
        // Show loading notification
        showNotification('Updating post...', 'info');
        
        // Update post in database
        const { error } = await window.supabaseClient
            .from('posts')
            .update({ content: content })
            .eq('id', postId);
        
        if (error) {
            throw error;
        }
        
        // Show success notification
        showNotification('Post updated successfully!', 'success');
        
        // Get post element
        const postElement = document.querySelector(`.post-item[data-id="${postId}"]`);
        if (!postElement) {
            return;
        }
        
        // Replace edit form with updated content
        const editForm = postElement.querySelector('.edit-post-form');
        const postContent = document.createElement('div');
        postContent.className = 'post-content';
        postContent.innerHTML = content;
        
        editForm.replaceWith(postContent);
        postElement.querySelector('.post-actions').style.display = 'flex';
        
    } catch (error) {
        console.error('Error updating post:', error);
        showNotification('Error updating post. Please try again.', 'error');
    }
}

// Function to cancel edit
function cancelEdit(postId, originalContent) {
    // Get post element
    const postElement = document.querySelector(`.post-item[data-id="${postId}"]`);
    if (!postElement) {
        return;
    }
    
    // Replace edit form with original content
    const editForm = postElement.querySelector('.edit-post-form');
    const postContent = document.createElement('div');
    postContent.className = 'post-content';
    postContent.innerHTML = originalContent;
    
    editForm.replaceWith(postContent);
    postElement.querySelector('.post-actions').style.display = 'flex';
}

// Function to delete post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    try {
        // Delete post from database
        const { error } = await window.supabaseClient
            .from('posts')
            .delete()
            .eq('id', postId);
        
        if (error) {
            throw error;
        }
        
        // Remove post element from DOM
        const postElement = document.querySelector(`.post-item[data-id="${postId}"]`);
        if (postElement) {
            postElement.remove();
        }
        
        // Show success notification
        showNotification('Post deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting post:', error);
        showNotification('Error deleting post. Please try again.', 'error');
    }
}