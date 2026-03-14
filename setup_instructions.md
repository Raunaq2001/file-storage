# Setup Instructions for Raunaq_Cloud

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Raunaq_Cloud
   - **Homepage URL**: `https://yourusername.github.io/file-storage`
   - **Authorization callback URL**: `https://yourusername.github.io/file-storage?callback`
4. Click **Register application**
5. Copy the **Client ID** (you'll need it)

## Step 2: Configure Application

Open `script.js` and find the CONFIG section. Replace the placeholders:

```javascript
const CONFIG = {
    // Your GitHub OAuth Client ID
    OAUTH_URL: 'https://github.com/login/oauth/authorize',
    // Your OAuth Redirect URI (GitHub Pages URL)
    REDIRECT_URI: 'https://yourusername.github.io/file-storage?callback',
    // Your repository owner (your GitHub username)
    REPO_OWNER: 'yourusername',
    // Your repository name
    REPO_NAME: 'file-storage'
};
```

## Step 3: Create GitHub Repository

1. Create a new private repository named `file-storage`
2. Go to repository settings > Pages
3. Enable GitHub Pages from the root directory
4. Copy the GitHub Pages URL

## Step 4: Update OAuth Redirect URI

After getting your GitHub Pages URL:

1. Go back to your OAuth App settings
2. Update the **Authorization callback URL** to:
   `https://yourusername.github.io/file-storage?callback`
3. Save the changes

## Step 5: Test Locally

```bash
# If npm is available
npm install
npm start

# Or open index.html directly in browser
```

## Step 6: Deploy to GitHub Pages

1. Push all files to your `file-storage` repository
2. Ensure GitHub Pages is enabled
3. Visit your GitHub Pages URL

## Step 7: First Time Setup

When you first visit the app:

1. Click **Login with GitHub**
2. Authorize the application
3. The app will create the repository if it doesn't exist
4. Start uploading files!

## Configuration Options

You can also configure via prompts:

1. Open `index.html` in browser
2. Click **Login with GitHub**
3. When prompted, enter:
   - Client ID from Step 1
   - Redirect URI from Step 2
   - Repository owner (your username)
   - Repository name (default: `file-storage`)

## Security Notes

- The application uses PKCE for secure OAuth
- No client secrets are stored
- All file operations are authenticated
- Files are stored in your private repository