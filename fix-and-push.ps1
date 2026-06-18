Set-Location -Path $PSScriptRoot

Write-Host "=== Removing git lock ===" -ForegroundColor Yellow
Remove-Item -Force -ErrorAction SilentlyContinue ".git\index.lock"
Remove-Item -Force -ErrorAction SilentlyContinue ".git\index"

Write-Host "=== Rebuilding git index ===" -ForegroundColor Yellow
git read-tree HEAD

Write-Host "=== Unstaging deletions ===" -ForegroundColor Yellow
git restore --staged .

Write-Host "=== Git status ===" -ForegroundColor Yellow
git status --short | Select-Object -First 10

Write-Host "=== Pushing to GitHub ===" -ForegroundColor Green
git push origin main

Write-Host "=== Done! ===" -ForegroundColor Green
Read-Host "Press Enter to close"
