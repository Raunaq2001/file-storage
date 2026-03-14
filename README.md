# GitHub File Storage Application

A responsive web application for uploading and downloading files, storing them securely in a private GitHub repository and serving via GitHub Pages.

## 🚀 Features

- **OAuth Authentication**: Secure GitHub login with PKCE
- **File Upload**: Drag & drop or browse interface with progress indicators
- **File Management**: Browse, download, and delete files
- **Responsive Design**: Mobile-first approach working on all devices
- **PWA Ready**: Installable as a progressive web app
- **Security**: Input validation, CSRF protection, rate limiting
- **GitHub Integration**: Uses GitHub REST API for all operations

## 📋 Setup Instructions

### 1. Create GitHub OAuth App

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: GitHub File Storage
   - **Homepage URL**: `https://yourusername.github.io/file-storage`
   - **Authorization callback URL**: `https://yourusername.github.io/file-storage?callback`
4. Click **Register application**
5. Note the **Client ID** (you'll need it)

### 2. Configure Your Repository

1. Create a new private repository (e.g., `file-storage`)
2. Clone this repository or create a new GitHub Pages site
3. Set up GitHub Pages from the repository

### 3. Configure Application Settings

Edit `script.js` or use the built-in configuration prompts:

```javascript
// In script.js, modify the CONFIG object:
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

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Locally

```bash
npm start
```

Open `http://localhost:8080` in your browser.

## 🔗 Usage

### Authentication

1. Click **Login with GitHub**
2. Authorize the application
3. You'll be redirected back to the app
4. Start uploading and managing files

### File Upload

1. **Drag & Drop**: Drag files onto the upload area
2. **Browse**: Click "Browse Files" to select files
3. **Progress**: See upload progress with percentage indicators
4. **Multiple Files**: Upload multiple files simultaneously

### File Management

1. **Browse Files**: View all uploaded files in the repository
2. **Download**: Click download button for any file
3. **Delete**: Remove files with the delete button
4. **Search**: Filter files using the search bar

### Repository Configuration

The application will automatically:
- Create the repository if it doesn't exist
- Store files as raw content in the repository
- Organize files in the repository root

## 🛡️ Security Features

- **PKCE Authentication**: Secure OAuth flow without client secrets
- **Input Validation**: All user inputs are sanitized
- **CSRF Protection**: State validation in OAuth flow
- **Rate Limiting**: Built-in GitHub API rate limits
- **Secure Storage**: Tokens stored in localStorage with encryption

## 📱 Responsive Design

The application works seamlessly on:

- **Desktop**: Full-featured interface with drag & drop
- **Tablet**: Optimized layouts with touch support
- **Mobile**: Touch-friendly interface with minimal scrolling

## 🚀 Deployment

### GitHub Pages Deployment

The application is designed for GitHub Pages:

1. Push to `main` branch
2. GitHub Actions automatically deploys
3. Visit `https://yourusername.github.io/file-storage`

### Manual Deployment

1. Copy all files to your GitHub Pages repository
2. Ensure `index.html` is in the root
3. Configure OAuth settings
4. Deploy and test

## 📊 Browser Support

- **Chrome 88+** (recommended)
- **Firefox 85+**
- **Safari 14+**
- **Edge 88+**
- **Mobile Safari**
- **Mobile Chrome**

## 📈 Troubleshooting

### Common Issues

1. **OAuth Not Working**
   - Check Client ID is correct
   - Verify Redirect URI matches exactly
   - Ensure GitHub Pages is enabled

2. **File Upload Fails**
   - Check repository permissions
   - Verify OAuth scopes include `repo`
   - Check file size limits (GitHub has 100MB limit)

3. **API Rate Limiting**
   - GitHub has rate limits (60/hour for unauthenticated, 5000/hour for authenticated)
   - Wait and retry if rate limited

### Debug Mode

Add `?debug=1` to URL to enable:
- Console logging
- Error details
- API response inspection

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📚 Dependencies

- **GitHub REST API**: All backend operations
- **Vanilla JavaScript**: No frameworks for performance
- **Modern CSS**: Grid, Flexbox, animations
- **Font Awesome**: Icons (loaded from CDN)

## 🔐 Privacy

- No user data is collected
- Files are stored only in your private GitHub repository
- Authentication tokens are stored locally
- No third-party analytics

## 📞 Support

- **Documentation**: This README
- **Issues**: GitHub Issues section
- **Email**: Not available (open source project)

---

**Note**: This application requires GitHub OAuth credentials and a GitHub account to function. See setup instructions above.