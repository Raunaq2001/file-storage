# Vercel Deployment Guide (Serverless Backend)

## Why Vercel?

We need a serverless function to handle the OAuth token exchange (avoids CORS). Vercel provides free, easy deployment for serverless functions alongside static files.

## Prerequisites

1. **GitHub OAuth App** already created with:
   - Authorization callback URL: `https://your-frontend-url.vercel.app/?callback` (or GitHub Pages URL)
   - Client ID: (you have it)
   - Client Secret: (you have it)

2. **Vercel account** (free): https://vercel.com/signup

## Deployment Steps

### Option A: Deploy Full App to Vercel (Recommended)

Deploy both frontend and backend together on Vercel:

1. **Install Vercel CLI** (optional, you can use GitHub integration):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd /path/to/Raunaq_Cloud
   vercel --prod
   ```

4. **Set Environment Variables** in Vercel:
   - Go to your project on Vercel dashboard
   - Settings → Environment Variables
   - Add:
     - `GITHUB_CLIENT_ID` = your OAuth App Client ID
     - `GITHUB_CLIENT_SECRET` = your OAuth App Client Secret

5. **Update OAuth App Redirect URI**:
   - After Vercel deployment, you'll get a URL like: `https://your-project.vercel.app`
   - Update your OAuth App's **Authorization callback URL** to:
     ```
     https://your-project.vercel.app/?callback
     ```

6. **Test** your deployed app at the Vercel URL

---

### Option B: Deploy API Only to Vercel, Frontend on GitHub Pages

If you want to keep frontend on GitHub Pages:

1. Deploy **only the `api/` folder** to Vercel:
   ```bash
   # Create a new vercel.json in root that only serves API
   # Then deploy
   vercel --prod
   ```

2. Vercel will give you an API URL like: `https://your-api.vercel.app/api/oauth-callback`

3. In `app.js` (frontend), update the API endpoint:
   ```javascript
   // Change:
   const response = await fetch('/api/oauth-callback', { ... });
   // To:
   const response = await fetch('https://your-api.vercel.app/api/oauth-callback', { ... });
   ```

4. Update OAuth App redirect URI to your GitHub Pages URL: `https://raunaq2001.github.io/file-storage/?callback`

---

## Environment Variables on Vercel

1. Go to your Vercel project dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add**
5. Add these two variables:

| Name | Value | Environment |
|------|-------|-------------|
| `GITHUB_CLIENT_ID` | `Ov23lirVtsDOnCAq92mA` | Production |
| `GITHUB_CLIENT_SECRET` | `your_client_secret_here` | Production |

6. Click **Save**
7. **Redeploy** your project

---

## Updating OAuth App Settings

1. Go to: https://github.com/settings/developers
2. Click your OAuth App
3. Update **Authorization callback URL** to your Vercel URL:
   ```
   https://your-project.vercel.app/?callback
   ```
4. Click **Update application**

---

## Testing

1. Open your Vercel-deployed app
2. Click "Login with GitHub"
3. Authorize the application
4. You should see "Authentication successful!"
5. Upload/download files should work

---

## Troubleshooting

### 401 Unauthorized from GitHub
- Check `GITHUB_CLIENT_SECRET` is set correctly in Vercel
- Redeploy after changing env vars

### CORS Errors
- Vercel serverless function has CORS headers enabled
- If using different domains, ensure the frontend calls the full API URL

### 404 on /api/oauth-callback
- Check Vercel deployment logs
- Ensure `api/` folder exists in your project
- Redeploy with `vercel --prod`

---

**Note**: Vercel free tier includes 100 GB-hours of serverless functions per month, plenty for personal use.

---

## Next Steps After Vercel Deployment

1. ✅ Deploy to Vercel
2. ✅ Set environment variables
3. ✅ Update OAuth callback URL
4. ✅ Test authentication
5. ✅ Test file upload/download
6. (Optional) Configure custom domain in Vercel
