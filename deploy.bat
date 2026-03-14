@echo off
REM Raunaq_Cloud Deploy Helper for Windows
REM Handles git conflicts and deploys to GitHub Pages

echo === Raunaq_Cloud Deploy Helper ===
echo Checking git status...

REM Check if we're in a git repository
if not exist .git (
    echo Error: Not a git repository. Run 'git init' first.
    pause
    exit /b 1
)

REM Check for uncommitted changes
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo Error: You have uncommitted changes.
    echo Please commit or stash your changes first.
    echo.
    git status
    pause
    exit /b 1
)

echo Attempting to pull from remote...

REM Try to pull first (handle conflicts gracefully)
git pull origin main
if errorlevel 0 (
    echo Pull successful. No conflicts.
) else (
    echo Pull encountered issues. Checking for conflicts...

    REM Check if there are actually conflicts
    git ls-files --unmerged >nul 2>&1
    if not errorlevel 1 (
        echo Conflicts detected!
        echo.
        echo === CONFLICTING FILES ===
        for /f "tokens=2" %%f in ('git ls-files --unmerged') do (
            echo %%f
        )
        echo.
        echo Please resolve conflicts manually:
        echo 1. Open conflicting files in your editor
        echo 2. Look for conflict markers: <<<<<<<, =======, >>>>>>>
        echo 3. Remove markers and keep desired content
        echo 4. Run 'git add <file>' for each resolved file
        echo 5. Run 'git commit' to finish merge
        echo.
        pause
        exit /b 1
    ) else (
        echo No conflicts. Continuing with deployment...
    )
)

echo.
echo === PUSHING TO GITHUB ===
echo Attempting to push to GitHub...

REM Try to push with force (safe if no conflicts)
git push -u origin main --force-with-lease
if errorlevel 0 (
    echo.
    echo Deployment successful!
    echo.
    echo Your Raunaq_Cloud app is now live!
    echo Visit: https://YOUR-USERNAME.github.io/YOUR-REPO-NAME
    echo.
    echo Next steps:
    echo 1. Test the app in your browser
    echo 2. Click 'Login with GitHub'
    echo 3. Authorize the application
    echo 4. Start uploading files!
    echo.
    echo If you encounter any issues, check the GitHub Actions tab for deployment logs.
    echo.
    pause
    exit /b 0
) else (
    echo.
    echo Push failed!
    echo.
    echo Common issues and solutions:
    echo 1. Authentication error - Use Personal Access Token instead of password
    echo 2. Network issues - Check your internet connection
    echo 3. Repository access - Ensure you have write access
    echo.
    echo Try running this command manually:
    echo git push -u origin main --force-with-lease
    echo.
    pause
    exit /b 1
)

echo.
echo Deployment complete!
echo Visit your app: https://YOUR-USERNAME.github.io/YOUR-REPO-NAME
pause