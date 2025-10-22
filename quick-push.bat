@echo off
git add .
git commit -m "add-debug-logs"
git push origin main
echo Pushed! Wait 2 minutes then test again.
pause
