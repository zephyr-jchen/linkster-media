// Variables to store temporary data
let selectedImage = null;
let postToDelete = null;
let currentUser = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const res = await fetch(`/api/users/${currentUser.id}`);
    if (!res.ok) {
        alert('Failed to fetch user info');
        return;
    }
    const user = await res.json();
    currentUser.avatar = user.avatar || 'avatar.png';

    document.getElementById('post-username').textContent = user.username;
    document.getElementById('user-avatar').src = user.avatar|| 'avatar.png' ;
    document.getElementById('nav-avatar').src = user.avatar || 'avatar.png';

    setupImageUpload();
    loadPosts();
}



// Sign out function
function signOut() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Setup image upload and preview
function setupImageUpload() {
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');

    imageUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                selectedImage = e.target.result;
                imagePreview.innerHTML = `<img src="${selectedImage}" alt="Upload Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Load posts from backend
async function loadPosts(searchTerm = '') {
    const postFeed = document.getElementById('post-feed');
    postFeed.innerHTML = '';

    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();

        const filteredPosts = searchTerm
            ? posts.filter(post => post.username.toLowerCase().includes(searchTerm.toLowerCase()) || post.content.toLowerCase().includes(searchTerm.toLowerCase()))
            : posts;

        filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        for (const post of filteredPosts) {
            const isOwnPost = post.user_id === currentUser.id;

            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.dataset.postId = post.id;

            const postHeader = document.createElement('div');
            postHeader.className = 'post-header';

            const userIcon = document.createElement('div');
            userIcon.className = 'user-icon';
            userIcon.innerHTML = `<img src="${post.avatar || "avatar.png"}" alt="avatar" class="post-user-avatar">`;
            userIcon.style.cursor = 'pointer';
            

            const usernameSpan = document.createElement('span');
            usernameSpan.className = 'username';
            usernameSpan.textContent = post.username;
            usernameSpan.style.cursor = 'pointer';
            usernameSpan.onclick = () => navigateToProfile(post.user_id);

            const timestampSpan = document.createElement('span');
            timestampSpan.style.marginLeft = 'auto';
            timestampSpan.style.fontSize = '12px';
            timestampSpan.style.color = '#65676b';
            timestampSpan.textContent = new Date(post.created_at).toLocaleString('en-CA', { timeZone: 'America/Toronto' });

            postHeader.appendChild(userIcon);
            postHeader.appendChild(usernameSpan);
            postHeader.appendChild(timestampSpan);

            const postContent = document.createElement('div');
            postContent.className = 'post-content';
            postContent.textContent = post.content;

            let postImage = '';
            if (post.image_url) {
                postImage = document.createElement('img');
                postImage.src = post.image_url;
                postImage.className = 'post-image';
                postImage.alt = 'Post image';
            }

            // Likes + Comments Count
            const postFooter = document.createElement('div');
            postFooter.className = 'post-footer';

            const likeResponse = await fetch(`/api/likes/count/${post.id}`);
            const likeData = await likeResponse.json();

            const commentResponse = await fetch(`/api/comments/${post.id}`);
            const comments = await commentResponse.json();

            postFooter.innerHTML = `
                <div class="post-stats">
                    <i class="fas fa-thumbs-up"></i>
                    <span>${likeData.count}</span>
                </div>
                <div class="post-stats">
                    <span>${comments.length} comments</span>
                </div>
            `;

            const postActions = document.createElement('div');
            postActions.className = 'post-actions-container';
            postActions.innerHTML = `
                <div class="post-action" onclick="toggleLike('${post.id}')">
                    <i class="fas fa-thumbs-up"></i>
                    <span>Like</span>
                </div>
                <div class="post-action" onclick="focusCommentInput('${post.id}')">
                    <i class="fas fa-comment"></i>
                    <span>Comment</span>
                </div>
                ${isOwnPost ? `<div class="post-action" onclick="showDeleteConfirmation('${post.id}')">
                        <i class="fas fa-trash"></i><span>Delete</span>
                    </div>` : ''
                }
            `;

            // Comments Section
            const commentsSection = document.createElement('div');
            commentsSection.className = 'comments-section';

            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <strong>${comment.username}</strong>: ${comment.content}
                `;
                commentsSection.appendChild(commentElement);
            });

            // Comment Input
            const commentInput = document.createElement('div');
            commentInput.className = 'comment-input';
            commentInput.innerHTML = `
                <input type="text" placeholder="Write a comment..." id="comment-input-${post.id}">
                <button onclick="addComment('${post.id}')">Post</button>
            `;
            commentsSection.appendChild(commentInput);

            postElement.appendChild(postHeader);
            postElement.appendChild(postContent);
            if (postImage) postElement.appendChild(postImage);
            postElement.appendChild(postFooter);
            postElement.appendChild(postActions);
            postElement.appendChild(commentsSection);

            postFeed.appendChild(postElement);
        }

        if (filteredPosts.length === 0) {
            postFeed.innerHTML = '<div class="no-posts">No posts found.</div>';
        }
    } catch (err) {
        console.error('Failed to load posts:', err);
    }
}

// ---------- Comment ----------

async function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    if (!content) return;

    await fetch(`/api/comments/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, content })
    });

    input.value = '';
    loadPosts();
}

// ---------- Like ----------

async function toggleLike(postId) {
    await fetch(`/api/likes/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
    });
    loadPosts();
}

async function createPost() {
    const postContent = document.getElementById('post-content').value.trim();
    const imageInput = document.getElementById('image-upload');
    const imageFile = imageInput.files[0];

    if (postContent === '' && !imageFile) {
        alert('Please enter some content or add an image.');
        return;
    }

    let imageUrl = null;

    // Step 1: upload image to GCS via backend
    if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadResponse = await fetch('/api/uploads', {
            method: 'POST',
            body: formData
        });

        if (!uploadResponse.ok) {
            alert('Image upload failed.');
            return;
        }

        const { url } = await uploadResponse.json();
        imageUrl = url; // GCS URL returned by backend
    }

    // Step 2: Create post
    const postData = {
        content: postContent,
        image_url: imageUrl,
        user_id: currentUser.id
    };

    const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    });

    if (response.ok) {
        document.getElementById('post-content').value = '';
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('image-upload').value = '';
        selectedImage = null;
        loadPosts();
    } else {
        alert('Post creation failed.');
    }
}



function focusCommentInput(postId) {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    if (commentInput) commentInput.focus();
}

function showDeleteConfirmation(postId) {
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'block';
    postToDelete = postId;

    document.getElementById('confirm-yes').onclick = () => {
        deletePost(postToDelete);
        closeModal();
    };
    document.getElementById('confirm-no').onclick = closeModal;
}

function closeModal() {
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'none';
    postToDelete = null;
}



async function deletePost(postId) {
    const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    if (response.ok) {
        loadPosts();
    } else {
        alert('Failed to delete post.');
    }
}

function searchPosts() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    loadPosts(searchTerm);
}

function navigateToProfile(userId = null) {
    if (!userId) userId = currentUser.id;
    window.location.href = `profile.html?userId=${userId}`;
}

window.onclick = function(event) {
    const modal = document.getElementById('confirmation-modal');
    if (event.target === modal) {
        closeModal();
    }
};
