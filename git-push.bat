@echo off
cd /d "%~dp0"
echo === Fixing git index ===
del /f .git\index.lock 2>nul
git read-tree HEAD
echo === Unstaging deletions ===
git restore --staged .
echo === Checking status ===
git status --short
echo === Pushing to GitHub ===
git push origin main
echo === Done! ===
pause
