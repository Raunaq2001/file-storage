# Claude Code Instructions

## Project Overview
This is a GitHub file storage web application that allows users to upload/download files using GitHub as backend storage. The application is built with vanilla JavaScript, HTML5, and CSS3.

## Key Features
- OAuth authentication with GitHub
- Drag & drop file upload
- Responsive design (mobile-first)
- PWA ready with service worker
- File management (upload, download, delete)
- GitHub Pages deployment

## File Structure
- `index.html` - Main application interface
- `styles.css` - Responsive styling and animations
- `script.js` - Core functionality and GitHub API integration
- `manifest.json` - PWA configuration
- `sw.js` - Service worker for offline support
- `README.md` - Complete documentation
- `setup_instructions.md` - Step-by-step setup guide

## Development Guidelines

### Authentication
- Uses GitHub OAuth with PKCE (no client secrets stored)
- Tokens stored in localStorage
- Always check `state.token` before API calls

### File Operations
- Validate file size (100MB max)
- Use `validateFile()` before upload
- Show progress indicators during operations
- Handle GitHub API errors gracefully

### Responsive Design
- Mobile-first approach
- CSS Grid and Flexbox layouts
- Touch-friendly interfaces
- Breakpoints at 480px and 768px

### Security
- No hardcoded secrets in client-side code
- HTTPS required for OAuth
- Input validation and sanitization
- Rate limiting via GitHub API limits

## Common Tasks

### Testing Locally
```bash
# Install dependencies if npm available
npm install
npm start
# Or open index.html directly in browser
```

### Configuration
- OAuth Client ID from GitHub settings
- Redirect URI must match GitHub Pages URL
- Repository owner and name in CONFIG

### Deployment
- Push to GitHub Pages repository
- Wait 2-3 minutes for deployment
- Test OAuth flow after deployment

## Error Handling
- Always show user-friendly error messages
- Log technical details to console for debugging
- Handle network failures gracefully
- Provide clear recovery instructions

## Performance
- Service worker for caching
- Progress indicators for long operations
- Debounced search functionality
- Efficient DOM updates

## Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile browsers

## Security Notes
- Never expose client secrets in client-side code
- Use HTTPS for all operations
- Validate all user inputs
- GitHub OAuth handles most security concerns