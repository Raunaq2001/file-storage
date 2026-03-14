// ===== Configuration =====
const CONFIG = {
    GITHUB_API: 'https://api.github.com',
    OAUTH_URL: 'https://github.com/login/oauth/authorize',
    TOKEN_URL: 'https://github.com/login/oauth/access_token',
    AUTH_SCOPES: 'repo',
    // File limits (in bytes) - 100MB is GitHub's max file size
    MAX_FILE_SIZE: 100 * 1024 * 1024,
    // Allowed MIME types (null means all allowed)
    ALLOWED_TYPES: null,
    // Allowed file extensions (null means all allowed)
    ALLOWED_EXTENSIONS: null,
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'github_app_token',
        REFRESH_TOKEN: 'github_app_refresh',
        CLIENT_ID: 'Ov23lirVtsDOnCAq92mA',
        REDIRECT_URI: 'https://Raunaq2001.github.io/file-storage?callback',
        REPO_OWNER: 'Raunaq2001',
        REPO_NAME: 'file-storage-private',
        PKCE_VERIFIER: 'pkce_verifier',
        STATE: 'oauth_state',
        CONFIG_SET: 'app_config_complete'
    }
};

// ===== State =====
const state = {
    token: null,
    user: null,
    files: [],
    uploading: false,
    currentRepo: null
};

// ===== DOM Elements =====
const elements = {
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    userInfo: document.getElementById('userInfo'),
    userName: document.getElementById('userName'),
    userAvatar: document.getElementById('userAvatar'),
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    browseBtn: document.getElementById('browseBtn'),
    fileList: document.getElementById('fileList'),
    uploadedFiles: document.getElementById('uploadedFiles'),
    refreshBtn: document.getElementById('refreshBtn'),
    searchInput: document.getElementById('searchInput'),
    fileBrowser: document.getElementById('fileBrowser'),
    statusMessages: document.getElementById('statusMessages'),
    progressBar: document.getElementById('progressBar'),
    progressFill: document.querySelector('.progress-fill'),
    progressText: document.querySelector('.progress-text')
};

// ===== Utility Functions =====

function generateRandomString(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Storage Functions =====
// ===== Critical OAuth Fix =====
// Remove localStorage dependency - use hardcoded values directly
function getConfig(key, defaultValue = null) {
    console.log('=== getConfig called for:', key, '===');
    console.log('Hardcoded value from CONFIG:', CONFIG.STORAGE_KEYS[key]);

    // For OAuth critical values, always use the hardcoded values
    if (key === CONFIG.STORAGE_KEYS.CLIENT_ID ||
        key === CONFIG.STORAGE_KEYS.REDIRECT_URI ||
        key === CONFIG.STORAGE_KEYS.REPO_OWNER ||
        key === CONFIG.STORAGE_KEYS.REPO_NAME) {
        console.log('Using hardcoded value from CONFIG:', CONFIG.STORAGE_KEYS[key]);
        return CONFIG.STORAGE_KEYS[key];
    }

    // For other values, try localStorage
    const stored = localStorage.getItem(CONFIG.STORAGE_KEYS[key]);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return stored; // Return raw string if not JSON
        }
    }
    return defaultValue;
}

function setConfig(key, value) {
    console.log('=== setConfig called for:', key, '===');
    console.log('Value being stored:', value);
    localStorage.setItem(CONFIG.STORAGE_KEYS[key], JSON.stringify(value));
}

function clearAuthData() {
    Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
        if (key !== CONFIG.STORAGE_KEYS.CLIENT_ID &&
            key !== CONFIG.STORAGE_KEYS.REDIRECT_URI &&
            key !== CONFIG.STORAGE_KEYS.REPO_OWNER &&
            key !== CONFIG.STORAGE_KEYS.REPO_NAME) {
            localStorage.removeItem(key);
        }
    });
}

// ===== Authentication =====

async function initiateOAuth() {
    console.log('=== initiateOAuth called ===');

    // Debug: Check what's in localStorage
    console.log('localStorage contents:');
    Object.keys(CONFIG.STORAGE_KEYS).forEach(key => {
        const val = localStorage.getItem(CONFIG.STORAGE_KEYS[key]);
        console.log(`  ${key}: ${val ? (val.length > 50 ? val.substring(0, 50) + '...' : val) : '(empty)'}`);
    });

    const clientId = getConfig(CONFIG.STORAGE_KEYS.CLIENT_ID);
    const redirectUri = getConfig(CONFIG.STORAGE_KEYS.REDIRECT_URI);

    console.log('Retrieved config:', { clientId, redirectUri });
    console.log('CLIENT_ID from CONFIG:', CONFIG.STORAGE_KEYS.CLIENT_ID);
    console.log('REDIRECT_URI from CONFIG:', CONFIG.STORAGE_KEYS.REDIRECT_URI);

    if (!clientId || !redirectUri) {
        showStatus('Please configure GitHub OAuth App credentials first. See README.md', 'error');
        promptForCredentials();
        return;
    }

    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(32);

    setConfig(CONFIG.STORAGE_KEYS.PKCE_VERIFIER, codeVerifier);
    setConfig(CONFIG.STORAGE_KEYS.STATE, state);

    console.log('Generated PKCE:', { codeVerifier, state, codeChallenge });

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: CONFIG.AUTH_SCOPES,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });

    console.log('OAuth URL being constructed:');
    console.log('Base:', CONFIG.OAUTH_URL);
    console.log('Params:', Object.fromEntries(params));

    // Store current URL to check when returning from OAuth
    sessionStorage.setItem('oauth_pending', 'true');

    const finalUrl = `${CONFIG.OAUTH_URL}?${params.toString()}`;
    console.log('Final URL:', finalUrl);

    window.location.href = finalUrl;
}

async function exchangeCodeForToken(code, state, verifier) {
    const clientId = getConfig(CONFIG.STORAGE_KEYS.CLIENT_ID);

    const response = await fetch(CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: '', // Not needed for PKCE public client
            code: code,
            redirect_uri: getConfig(CONFIG.STORAGE_KEYS.REDIRECT_URI),
            state: state,
            code_verifier: verifier
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Failed to exchange code');
    }

    return response.json();
}

async function handleOAuthCallback() {
    console.log('=== OAuth Callback Handler ===');
    console.log('Current URL:', window.location.href);
    console.log('Search params:', window.location.search);

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    const redirectUri = getConfig(CONFIG.STORAGE_KEYS.REDIRECT_URI);

    console.log('Expected redirect URI:', redirectUri);
    console.log('Code present:', !!code);
    console.log('State present:', !!state);
    console.log('Error present:', !!error);

    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);

    if (error) {
        console.error('OAuth error:', error, errorDescription);
        showStatus(`Authentication failed: ${errorDescription || error}`, 'error');
        return false;
    }

    if (!code) {
        console.warn('No code in URL - might be direct access or callback URL mismatch');
        // Check if we're on the callback URL
        if (window.location.pathname.endsWith('?callback') ||
            window.location.search.includes('callback')) {
            console.warn('On callback URL but no code - GitHub may not have redirected properly');
        }
        return false;
    }

    const storedState = getConfig(CONFIG.STORAGE_KEYS.STATE);
    const verifier = getConfig(CONFIG.STORAGE_KEYS.PKCE_VERIFIER);

    console.log('State comparison:', { received: state, stored: storedState, match: state === storedState });
    console.log('Verifier present:', !!verifier);

    if (state !== storedState || !verifier) {
        console.error('State mismatch or missing verifier');
        showStatus('Invalid OAuth state. Please try again.', 'error');
        return false;
    }

    try {
        showStatus('Completing authentication...', 'info');
        const tokenData = await exchangeCodeForToken(code, state, verifier);
        console.log('Token exchange successful');
        setConfig(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, tokenData.access_token);

        // Clear sensitive data
        localStorage.removeItem(CONFIG.STORAGE_KEYS.PKCE_VERIFIER);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.STATE);

        showStatus('Authentication successful!', 'success');
        await loadUserInfo();
        return true;
    } catch (err) {
        console.error('Token exchange failed:', err);
        showStatus(`Authentication error: ${err.message}`, 'error');
        return false;
    }
}

function logout() {
    clearAuthData();
    state.token = null;
    state.user = null;
    state.files = [];
    document.getElementById('uploadedFiles').innerHTML = '';
    showAuthUI();
    showStatus('Logged out successfully', 'info');
}

function isAuthenticated() {
    return !!getConfig(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
}

// ===== GitHub API =====

async function githubAPI(endpoint, options = {}) {
    const token = getConfig(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);

    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(`${CONFIG.GITHUB_API}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            ...options.headers
        }
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
}

async function loadUserInfo() {
    try {
        const user = await githubAPI('/user');
        state.user = user;
        state.token = getConfig(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        showUserInfo();
        showStatus(`Welcome, ${user.login}!`, 'success');
        await loadRepositoryFiles();
    } catch (err) {
        showStatus(`Failed to load user: ${err.message}`, 'error');
        logout();
    }
}

function showUserInfo() {
    elements.loginBtn.classList.add('hidden');
    elements.userInfo.classList.remove('hidden');
    elements.userName.textContent = state.user.login;
    elements.userAvatar.textContent = state.user.login.charAt(0).toUpperCase();
    elements.userAvatar.style.backgroundImage = state.user.avatar_url ? `url(${state.user.avatar_url})` : '';
}

function showAuthUI() {
    elements.loginBtn.classList.remove('hidden');
    elements.userInfo.classList.add('hidden');
}

async function getRepository() {
    const owner = getConfig(CONFIG.STORAGE_KEYS.REPO_OWNER);
    const name = getConfig(CONFIG.STORAGE_KEYS.REPO_NAME);

    if (!owner || !name) {
        return null;
    }

    try {
        const repo = await githubAPI(`/repos/${owner}/${name}`);
        state.currentRepo = repo;
        return repo;
    } catch (err) {
        console.error('Repository not accessible:', err.message);
        return null;
    }
}

async function createRepository(name) {
    const user = state.user || await githubAPI('/user');

    try {
        const repo = await githubAPI('/user/repos', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                private: true,
                description: 'Private file storage repository'
            })
        });

        setConfig(CONFIG.STORAGE_KEYS.REPO_OWNER, user.login);
        setConfig(CONFIG.STORAGE_KEYS.REPO_NAME, name);
        state.currentRepo = repo;
        showStatus(`Created repository: ${name}`, 'success');
        return repo;
    } catch (err) {
        throw new Error(`Failed to create repository: ${err.message}`);
    }
}

async function ensureRepository() {
    const owner = getConfig(CONFIG.STORAGE_KEYS.REPO_OWNER);
    const name = getConfig(CONFIG.STORAGE_KEYS.REPO_NAME);

    if (!owner || !name) {
        showStatus('Please configure repository settings', 'info');
        return null;
    }

    const repo = await getRepository();
    if (repo) {
        return repo;
    }

    // Try to create repository if user is owner
    if (state.user && state.user.login === owner) {
        try {
            return await createRepository(name);
        } catch (err) {
            showStatus(err.message, 'error');
            return null;
        }
    }

    showStatus('Repository not found or inaccessible. Check configuration.', 'error');
    return null;
}

async function loadRepositoryFiles(path = '') {
    try {
        const repo = await ensureRepository();
        if (!repo) {
            elements.fileBrowser.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cog"></i>
                    <h3>Repository Not Configured</h3>
                    <p>Please configure your repository in the README instructions</p>
                </div>
            `;
            return;
        }

        const owner = getConfig(CONFIG.STORAGE_KEYS.REPO_OWNER);
        const name = getConfig(CONFIG.STORAGE_KEYS.REPO_NAME);
        const branch = repo.default_branch;

        showLoading(true);

        const contents = await githubAPI(
            `/repos/${owner}/${name}/contents/${path}?ref=${branch}`
        );

        state.files = contents;
        renderFileBrowser(contents);

    } catch (err) {
        if (err.message.includes('404')) {
            elements.fileBrowser.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>No Files Yet</h3>
                    <p>Upload your first file to get started</p>
                </div>
            `;
        } else {
            showStatus(`Failed to load files: ${err.message}`, 'error');
            elements.fileBrowser.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Files</h3>
                    <p>${err.message}</p>
                </div>
            `;
        }
    } finally {
        showLoading(false);
    }
}

function renderFileBrowser(contents) {
    if (!Array.isArray(contents)) {
        elements.fileBrowser.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file"></i>
                <h3>Single File</h3>
                <p>${contents.name}</p>
                <button class="btn btn-primary" style="margin-top:1rem" onclick="downloadFile('${contents.path}', '${contents.name}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `;
        return;
    }

    if (contents.length === 0) {
        elements.fileBrowser.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder"></i>
                <h3>Empty Directory</h3>
                <p>No files to display</p>
            </div>
        `;
        return;
    }

    const fileCards = contents.map(file => {
        const isDir = file.type === 'dir';
        const icon = isDir ? 'fa-folder' : 'fa-file-alt';
        const size = isDir ? '---' : formatFileSize(file.size);
        const downloadHtml = isDir ? '' : `
            <button class="btn btn-primary download-btn" onclick="downloadFile('${file.path}', '${file.name}')">
                <i class="fas fa-download"></i>
            </button>
            <button class="btn btn-danger delete-btn" onclick="deleteFile('${file.path}', '${file.sha}')">
                <i class="fas fa-trash"></i>
            </button>
        `;

        return `
            <div class="file-card" data-name="${file.name.toLowerCase()}">
                <div class="file-info">
                    <i class="fas ${icon} file-icon"></i>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${file.type === 'file' ? `Modified: ${new Date(file.commit?.commit?.committer?.date || file.last_modified).toLocaleDateString()}` : `Path: ${file.path}`}</p>
                    </div>
                </div>
                <div class="file-size">${size}</div>
                <div class="file-actions">
                    ${downloadHtml}
                </div>
            </div>
        `;
    }).join('');

    elements.fileBrowser.innerHTML = fileCards;
}

function showLoading(show) {
    if (show) {
        elements.fileBrowser.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading files...</p>
            </div>
        `;
    }
}

// ===== File Operations =====

async function uploadFile(file) {
    try {
        const repo = await ensureRepository();
        if (!repo) {
            showStatus('Cannot upload: repository not configured', 'error');
            return;
        }

        const owner = getConfig(CONFIG.STORAGE_KEYS.REPO_OWNER);
        const name = getConfig(CONFIG.STORAGE_KEYS.REPO_NAME);
        const branch = repo.default_branch;
        const path = file.name; // You could add path logic here

        // Check if file exists to get current SHA
        let sha = null;
        try {
            const existing = await githubAPI(`/repos/${owner}/${name}/contents/${path}?ref=${branch}`);
            if (existing && existing.sha) {
                sha = existing.sha;
            }
        } catch (err) {
            // File doesn't exist, will create new
        }

        const content = await readFileAsBase64(file);
        const body = {
            message: `Upload ${file.name}`,
            content: content,
            branch: branch
        };

        if (sha) {
            body.sha = sha;
        }

        showProgress(true);
        updateProgress(0);

        // Simulate progress (GitHub API doesn't provide upload progress)
        await simulateProgress();

        await githubAPI(`/repos/${owner}/${name}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });

        showStatus(`Uploaded: ${file.name}`, 'success');
        addFileToList(file.name, formatFileSize(file.size));
        await loadRepositoryFiles();

    } catch (err) {
        showStatus(`Upload failed: ${err.message}`, 'error');
    } finally {
        showProgress(false);
    }
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Extract base64 from data URL
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function simulateProgress() {
    for (let i = 0; i <= 100; i += 20) {
        updateProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    updateProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));
}

async function downloadFile(path, name) {
    try {
        const repo = await ensureRepository();
        if (!repo) {
            showStatus('Cannot download: repository not configured', 'error');
            return;
        }

        showStatus(`Downloading: ${name}...`, 'info');

        const owner = getConfig(CONFIG.STORAGE_KEYS.REPO_OWNER);
        const nameEncoded = encodeURIComponent(path);
        const fileData = await githubAPI(`/repos/${owner}/${repo.name}/contents/${nameEncoded}`);

        if (fileData.type === 'dir') {
            showStatus('Cannot download a directory', 'error');
            return;
        }

        // Decode base64 content
        const binaryString = atob(fileData.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileData.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showStatus(`Download complete: ${fileData.name}`, 'success');

    } catch (err) {
        showStatus(`Download failed: ${err.message}`, 'error');
    }
}

async function deleteFile(path, sha) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }

    try {
        const repo = await ensureRepository();
        if (!repo) {
            showStatus('Cannot delete: repository not configured', 'error');
            return;
        }

        showStatus('Deleting...', 'info');

        const owner = getConfig(CONFIG.STORAGE_KEYS.REPO_OWNER);
        const name = repo.name;
        const branch = repo.default_branch;

        await githubAPI(`/repos/${owner}/${name}/contents/${encodeURIComponent(path)}`, {
            method: 'DELETE',
            body: JSON.stringify({
                message: `Delete ${path}`,
                sha: sha,
                branch: branch
            })
        });

        showStatus(`Deleted: ${path}`, 'success');
        await loadRepositoryFiles();

    } catch (err) {
        showStatus(`Delete failed: ${err.message}`, 'error');
    }
}

// ===== UI Functions =====

function validateFile(file) {
    // Check file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showStatus(`File too large: ${file.name} (${formatFileSize(file.size)})`, 'error');
        return false;
    }

    // Check file type
    if (CONFIG.ALLOWED_TYPES && !CONFIG.ALLOWED_TYPES.includes(file.type)) {
        showStatus(`Invalid file type: ${file.name}`, 'error');
        return false;
    }

    // Check file extension
    if (CONFIG.ALLOWED_EXTENSIONS) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
            showStatus(`Invalid file extension: ${file.name}`, 'error');
            return false;
        }
    }

    return true;
}

function showStatus(message, type = 'info') {
    const msg = document.createElement('div');
    msg.className = `status-message ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' :
                 type === 'error' ? 'fa-exclamation-circle' :
                 'fa-info-circle';
    msg.innerHTML = `<i class="fas ${icon}"></i> ${message}`;

    elements.statusMessages.appendChild(msg);

    setTimeout(() => {
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(-10px)';
        setTimeout(() => msg.remove(), 300);
    }, 5000);
}

function showProgress(show) {
    elements.progressBar.classList.toggle('hidden', !show);
    if (!show) {
        updateProgress(0);
    }
}

function updateProgress(percent) {
    elements.progressFill.style.width = `${percent}%`;
    elements.progressText.textContent = `${percent}%`;
}

function addFileToList(name, size) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
        <input type="checkbox" class="select-checkbox" disabled>
        <span class="file-name">${name}</span>
        <span class="file-size">${size}</span>
        <span class="file-actions">
            <button class="btn btn-secondary" onclick="window.location.reload()">Refresh</button>
        </span>
    `;
    elements.uploadedFiles.appendChild(fileItem);
}

function filterFiles(searchTerm) {
    const cards = document.querySelectorAll('.file-card');
    const term = searchTerm.toLowerCase();

    cards.forEach(card => {
        const name = card.dataset.name;
        card.style.display = name.includes(term) ? 'grid' : 'none';
    });
}

// ===== Event Handlers =====

function handleFileSelect(files) {
    if (!state.token) {
        showStatus('Please login first', 'error');
        return;
    }

    for (const file of files) {
        if (validateFile(file)) {
            uploadFile(file);
        }
    }
}

function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files);
    }
}

// ===== Configuration Helper =====

function promptForCredentials() {
    const clientId = prompt('Enter your GitHub OAuth App Client ID:', '');
    if (clientId) {
        setConfig(CONFIG.STORAGE_KEYS.CLIENT_ID, clientId);
    }

    const redirectUri = prompt('Enter your OAuth Redirect URI (your GitHub Pages URL + ?callback):', '');
    if (redirectUri) {
        setConfig(CONFIG.STORAGE_KEYS.REDIRECT_URI, redirectUri);
    }

    const repoOwner = prompt('Enter GitHub username for repository owner:', state.user?.login || '');
    if (repoOwner) {
        setConfig(CONFIG.STORAGE_KEYS.REPO_OWNER, repoOwner);
    }

    const repoName = prompt('Enter repository name (will be created if needed):', 'file-storage');
    if (repoName) {
        setConfig(CONFIG.STORAGE_KEYS.REPO_NAME, repoName);
    }

    setConfig(CONFIG.STORAGE_KEYS.CONFIG_SET, true);
    showStatus('Configuration saved', 'success');
}

// ===== Initialization =====

function initializeApp() {
    // Check for OAuth callback
    handleOAuthCallback().then(authSuccess => {
        if (authSuccess) {
            return;
        }

        // If storing token directly
        if (isAuthenticated()) {
            loadUserInfo();
        } else {
            showAuthUI();
            elements.fileBrowser.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sign-in-alt"></i>
                    <h3>Login Required</h3>
                    <p>Please login with GitHub to access files</p>
                </div>
            `;
        }
    });

    // Event Listeners
    elements.loginBtn.addEventListener('click', initiateOAuth);
    elements.logoutBtn.addEventListener('click', logout);
    elements.refreshBtn.addEventListener('click', () => loadRepositoryFiles());
    elements.browseBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files);
            e.target.value = ''; // Reset
        }
    });

    elements.searchInput.addEventListener('input', debounce((e) => {
        filterFiles(e.target.value);
    }, 300));

    // Drag and drop
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);

    // Show upload list section
    elements.fileList.classList.remove('hidden');

    // Check configuration
    if (!getConfig(CONFIG.STORAGE_KEYS.CLIENT_ID)) {
        showStatus('⚠️ Please configure GitHub OAuth credentials (see README.md)', 'info');
    }
}

// Make functions globally accessible
window.downloadFile = downloadFile;
window.deleteFile = deleteFile;

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
