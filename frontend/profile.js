// Global variables
let currentUserId = null;
let profileUserId = null;

// Initialize page on load
document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    currentUserId = loggedInUser.id;

    const urlParams = new URLSearchParams(window.location.search);
    profileUserId = urlParams.get('userId') || currentUserId;

    try {
        await loadProfileInfo();
        await loadProfilePosts();
    } catch (error) {
        console.error('Error loading profile:', error);
    }
});

// Load user profile info
async function loadProfileInfo() {
    const response = await fetch(`/api/users/${profileUserId}`);
    if (!response.ok) throw new Error('User not found');

    const user = await response.json();

    document.getElementById('profile-name').textContent = `${user.first_name} ${user.last_name}`;
    document.getElementById('profile-username').textContent = `@${user.username}`;
    document.getElementById('user-birthdate').textContent = formatDate(user.birthdate);
    document.getElementById('user-gender').textContent = capitalizeFirstLetter(user.gender);
    document.getElementById('user-email').textContent = user.email;


    const avatarContainer = document.querySelector('.profile-avatar');
    avatarContainer.innerHTML = `
        <img id="profile-avatar-img" src="${user.avatar || 'avatar.png'}" alt="Avatar">
        <input type="file" id="avatar-upload" accept="image/*" style="display:none;">
    `;

    if (profileUserId == currentUserId) {
        avatarContainer.style.cursor = 'pointer';
        avatarContainer.onclick = () => document.getElementById('avatar-upload').click();
        document.getElementById('avatar-upload').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            await uploadAvatar(file);
            await loadProfileInfo();
        });
        const actionsContainer = document.getElementById('profile-actions');
        actionsContainer.innerHTML = `
        <button class="profile-action-btn primary-btn" onclick="openEditProfileModal()">
            <i class="fas fa-edit"></i> Edit Profile
        </button>
    `;
    }
    
    // Profile Action
    // const actionsContainer = document.getElementById('profile-actions');
    // if (profileUserId === currentUserId) {
        
    // } else {
    //     actionsContainer.innerHTML = `<button class="profile-action-btn primary-btn"><i class="fas fa-comment"></i> Message</button>`;
    // }
}


// Load posts of profile
async function loadProfilePosts() {
    const postFeed = document.getElementById('profile-post-feed');
    postFeed.innerHTML = '';

    const response = await fetch(`/api/posts/user/${profileUserId}`);
    const posts = await response.json();

    if (!posts.length) {
        postFeed.innerHTML = '<div class="no-posts">No posts to display.</div>';
        return;
    }

    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    for (const post of posts) {
        const isOwnPost = post.user_id === currentUserId;

        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.dataset.postId = post.id;

        const postHeader = document.createElement('div');
        postHeader.className = 'post-header';
        postHeader.innerHTML = `<span class="username">${post.username}</span><span style="margin-left: auto; font-size: 12px; color: #65676b;">${formatTimestamp(post.created_at)}</span>`;

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

        const postFooter = document.createElement('div');
        postFooter.className = 'post-footer';
        const likeCount = await getLikeCount(post.id);
        const commentCount = await getCommentCount(post.id);
        postFooter.innerHTML = `<div class="post-stats"><i class="fas fa-thumbs-up"></i> <span>${likeCount}</span></div><div class="post-stats"><span>${commentCount} comments</span></div>`;

        const postActions = document.createElement('div');
        postActions.className = 'post-actions-container';
        postActions.innerHTML = `
            <div class="post-action" onclick="toggleLike('${post.id}')">
                <i class="fas fa-thumbs-up"></i> <span>Like</span>
            </div>
            <div class="post-action" onclick="focusCommentInput('${post.id}')">
                <i class="fas fa-comment"></i> <span>Comment</span>
            </div>
            ${isOwnPost ? `<div class="post-action" onclick="deletePost('${post.id}')"><i class="fas fa-trash"></i> <span>Delete</span></div>` : ''}
        `;

        const commentsSection = document.createElement('div');
        commentsSection.className = 'comments-section';
        const comments = await getComments(post.id);
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.innerHTML = `<strong>${comment.username}:</strong> ${comment.content}`;
            commentsSection.appendChild(commentDiv);
        });

        const commentInput = document.createElement('div');
        commentInput.className = 'comment-input';
        commentInput.innerHTML = `<input type="text" placeholder="Write a comment..." id="comment-input-${post.id}"><button onclick="addComment('${post.id}')">Post</button>`;
        commentsSection.appendChild(commentInput);

        postElement.appendChild(postHeader);
        postElement.appendChild(postContent);
        if (postImage) postElement.appendChild(postImage);
        postElement.appendChild(postFooter);
        postElement.appendChild(postActions);
        postElement.appendChild(commentsSection);

        postFeed.appendChild(postElement);
    }
}

async function toggleLike(postId) {
    await fetch(`/api/likes/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
    });
    loadProfilePosts();
}

async function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    if (!content) return;

    await fetch(`/api/comments/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId, content })
    });
    loadProfilePosts();
}

async function getLikeCount(postId) {
    const res = await fetch(`/api/likes/count/${postId}`);
    const data = await res.json();
    return data.count || 0;
}

async function getCommentCount(postId) {
    const res = await fetch(`/api/comments/${postId}`);
    const comments = await res.json();
    return comments.length;
}

async function getComments(postId) {
    const res = await fetch(`/api/comments/${postId}`);
    return await res.json();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `${tabName}-pane`);
    });
}

function navigateToProfile(userId) {
    window.location.href = `profile.html?userId=${userId}`;
}

function goToHomepage() {
    window.location.href = 'homepage.html';
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        const res = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error('Failed to delete post');

        await loadProfilePosts();

    } catch (err) {
        console.error('Error deleting post:', err);
        alert('Error deleting post');
    }
}

function searchPosts() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    window.location.href = `homepage.html?search=${encodeURIComponent(searchTerm)}`;
}

function signOut() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function formatTimestamp(timestamp) {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} h ago`;
    return new Date(timestamp).toLocaleDateString();
}

function formatDate(date) {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function capitalizeFirstLetter(string) {
    if (!string) return 'Not specified';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`/api/users/${currentUserId}/avatar`, {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const result = await response.json();
        alert('Avatar uploaded!');
        document.getElementById('profile-avatar-img').src = result.url;
    } else {
        alert('Failed to upload avatar');
    }
}

function openEditProfileModal() {
    document.getElementById('edit-profile-modal').style.display = 'block';
}

function closeEditProfileModal() {
    document.getElementById('edit-profile-modal').style.display = 'none';
}

async function submitEditProfile() {
    const first_name = document.getElementById('edit-firstname').value;
    const last_name = document.getElementById('edit-lastname').value;
    const birthdate = document.getElementById('edit-birthdate').value;
    const gender = document.getElementById('edit-gender').value;
    const email = document.getElementById('edit-email').value;

    const response = await fetch(`/api/users/${currentUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, birthdate, gender, email })
    });

    if (response.ok) {
        alert('Profile updated');
        closeEditProfileModal();
        loadProfileInfo();
    } else {
        alert('Failed to update profile');
    }
}