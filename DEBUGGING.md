# OAuth Debugging Guide

## Common Issues and Fixes

### 1. 404 Error on Login
**Possible causes:**
- GitHub Pages not deployed yet
- Repository not found
- Incorrect OAuth App configuration

**Fix:**
- Wait 2-5 minutes for deployment
- Check GitHub Pages status in repository Settings
- Verify repository exists and is accessible

### 2. OAuth Redirect Loop
**Possible causes:**
- Callback URL mismatch
- Incorrect redirect URI in code
- OAuth App not configured properly

**Fix:**
- Ensure `REDIRECT_URI` matches exactly
- Check OAuth App settings
- Verify repository exists

### 3. Authentication Error
**Possible causes:**
- Invalid Client ID
- Repository not accessible
- Network issues

**Fix:**
- Check OAuth App settings
- Verify repository exists and is accessible
- Check network connection

## Debug Mode

To enable debug mode, add `?debug=1` to your app URL:

```
https://raunaq2001.github.io/file-storage/?debug=1
```

This will show:
- Console logs for OAuth flow
- Detailed error messages
- Network request information

## Check These Things

### 1. Repository Access
```bash
# Check if your GitHub Pages repo exists
git remote -v
# Should show: https://github.com/Raunaq2001/file-storage.git

# Check if you can access it
git ls-remote origin
```

### 2. OAuth App Settings
- Go to https://github.com/settings/developers
- Check your OAuth App
- Verify these match exactly:
  - Homepage URL: `https://raunaq2001.github.io/file-storage`
  - Authorization callback URL: `https://raunaq2001.github.io/file-storage?callback`

### 3. Network Issues
- Check internet connection
- Try accessing `https://raunaq2001.github.io/file-storage/` directly
- Check if GitHub is accessible

## Manual Testing

### Test OAuth Flow Manually

1. Open browser console (F12)
2. Try logging in
3. Check console for errors
4. Look for these messages:
   - "OAuth callback URL mismatch"
   - "Repository not found"
   - "Invalid client ID"

### Test Repository Access

```bash
# Test if you can access the repo
curl -I https://api.github.com/repos/Raunaq2001/file-storage

# Should return 200 OK if accessible
```

## Quick Fixes

### If you get 404 on GitHub Pages:
1. Wait 2-5 minutes for deployment
2. Check GitHub Pages status in Settings
3. Verify repository exists
4. Check Actions tab for build errors

### If you get OAuth errors:
1. Check OAuth App configuration
2. Verify Client ID matches
3. Check callback URL matches exactly
4. Verify repository exists and is accessible

## Emergency Steps

If nothing works:

1. **Delete and recreate repository**
2. **Re-enable GitHub Pages**
3. **Update OAuth App settings**
4. **Deploy again**

---

## What to Check First

1. **GitHub Pages deployment status** (Settings > Pages)
2. **OAuth App configuration** (Settings > Developer settings)
3. **Repository existence** (https://github.com/Raunaq2001/file-storage)
4. **Network connection** (try accessing GitHub)

---

## Need More Help?

If you're still getting 404:

1. Share the exact error message
2. Share what you see when you try to access the URL
3. Check if the repository exists on GitHub
4. Check if GitHub Pages is enabled

---

**Debug mode is enabled** - open browser console (F12) to see detailed OAuth flow information.