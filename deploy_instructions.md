# Deployment Instructions

## Option 1: GitHub Pages (Recommended)

1. **Create Repository**
   - Create a new private repository on GitHub
   - Name it `file-storage` (or your preferred name)
   - Initialize with README if needed

2. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Source: Deploy from a branch
   - Branch: main, / (root)
   - Save

3. **Copy GitHub Pages URL**
   - Note the URL (e.g., `https://username.github.io/file-storage`)

4. **Update OAuth Redirect URI**
   - Go to your OAuth App settings
   - Update Authorization callback URL to:
     `https://username.github.io/file-storage?callback`

5. **Push Files**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/file-storage.git
   git push -u origin main
   ```

6. **Test**
   - Visit your GitHub Pages URL
   - Click Login and authorize
   - Test file upload/download

## Option 2: Manual Deployment

1. Copy all files to your web server
2. Configure OAuth settings in `script.js`
3. Ensure HTTPS is available (OAuth requires HTTPS)
4. Test authentication and file operations

## Configuration Checklist

- [ ] GitHub OAuth App created with correct redirect URI
- [ ] Repository created and GitHub Pages enabled
- [ ] OAuth Client ID in `script.js`
- [ ] OAuth Redirect URI matches GitHub Pages URL
- [ ] Repository owner and name configured
- [ ] All files pushed to repository

## Post-Deployment

1. **First Login**
   - First login may take longer as repository is created
   - Check browser console for any errors

2. **File Upload**
   - Test with small files first
   - GitHub has 100MB file size limit

3. **Mobile Testing**
   - Test on different screen sizes
   - Verify touch interactions work

## Troubleshooting

### OAuth Issues
- Check console for "invalid_client" errors
- Verify redirect URI matches exactly
- Ensure OAuth scopes include `repo`

### File Upload Issues
- Check repository permissions
- Verify OAuth token is valid
- Check file size limits

### GitHub Pages Issues
- Wait a few minutes after enabling Pages
- Clear browser cache
- Check GitHub Pages settings

## Security Notes

- Always use HTTPS for OAuth
- Never expose client secrets in client-side code
- Use PKCE for secure OAuth flow
- Files are stored in your private repository only