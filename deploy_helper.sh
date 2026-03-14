#!/bin/bash

# GitHub File Storage Deploy Helper
# Handles git conflicts and deploys to GitHub Pages

echo "=== GitHub File Storage Deploy Helper ==="
echo "Checking git status..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not a git repository. Run 'git init' first."
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "Error: You have uncommitted changes."
    echo "Please commit or stash your changes first."
    echo ""
    git status
    exit 1
fi

# Try to pull first (handle conflicts gracefully)
echo "Attempting to pull from remote..."
if git pull origin main 2>/dev/null; then
    echo "Pull successful. No conflicts."
else
    echo "Pull encountered issues. Checking for conflicts..."

    # Check if there are actually conflicts
    if git ls-files --unmerged > /dev/null 2>&1; then
        echo "Conflicts detected!"
        echo ""
        echo "=== CONFLICTING FILES ==="
        git ls-files --unmerged | cut -f2 | uniq
        echo ""
        echo "Please resolve conflicts manually:"
        echo "1. Open conflicting files in your editor"
        echo "2. Look for conflict markers: <<<<<<<, =======, >>>>>>>"
        echo "3. Remove markers and keep desired content"
        echo "4. Run 'git add <file>' for each resolved file"
        echo "5. Run 'git commit' to finish merge"
        echo ""
        exit 1
    else
        echo "No conflicts. Continuing with deployment..."
    fi
fi

echo ""
echo "=== PUSHING TO GITHUB ==="
echo "Attempting to push to GitHub..."

# Try to push with force (safe if no conflicts)
if git push -u origin main --force-with-lease; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Your GitHub File Storage app is now live!"
    echo "Visit: https://YOUR-USERNAME.github.io/YOUR-REPO-NAME"
    echo ""
    echo "Next steps:"
    echo "1. Test the app in your browser"
    echo "2. Click 'Login with GitHub'"
    echo "3. Authorize the application"
    echo "4. Start uploading files!"
    echo ""
    echo "If you encounter any issues, check the GitHub Actions tab for deployment logs."
    echo ""
    exit 0
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Common issues and solutions:"
    echo "1. Authentication error - Use Personal Access Token instead of password"
    echo "2. Network issues - Check your internet connection"
    echo "3. Repository access - Ensure you have write access"
    echo ""
    echo "Try running this command manually:"
    echo "git push -u origin main --force-with-lease"
    echo ""
    exit 1
fi

echo ""
echo "Deployment complete!"
echo "Visit your app: https://YOUR-USERNAME.github.io/YOUR-REPO-NAME"