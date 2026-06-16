@echo off
F:
cd \codex-yunxing\zishahu\uploader
echo ============================================
echo   Zishahu Uploader v2.0
echo   http://localhost:4567
echo ============================================
echo.
python app.py
if errorlevel 1 pause
