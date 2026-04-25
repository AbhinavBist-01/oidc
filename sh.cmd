@echo off
if /I "%~1"=="key-gen.sh" (
  node "%~dp0key-gen.js"
  exit /b %errorlevel%
)

echo Unsupported script: %~1
exit /b 1