@echo off
setlocal
cd /d "%~dp0"

echo Capacitor APK Builder setup
where node >nul 2>nul || (echo Node.js is required. Install Node.js 20 or newer. & exit /b 1)
where npm >nul 2>nul || (echo npm was not found. Reinstall Node.js with npm. & exit /b 1)
where java >nul 2>nul || (echo Java JDK 21 is required. Install a JDK and set JAVA_HOME. & exit /b 1)

if not exist "build\index.html" (
  echo Creating starter build\index.html
  if not exist "build" mkdir "build"
  >"build\index.html" echo ^<!doctype html^>
  >>"build\index.html" echo ^<html lang="en"^>^<head^>^<meta charset="utf-8"^>^<meta name="viewport" content="width=device-width,initial-scale=1"^>^<title^>Capacitor App^</title^>^</head^>
  >>"build\index.html" echo ^<body^>^<h1^>Capacitor app is ready^</h1^>^<p^>Replace this page with your web app build.^</p^>^</body^>^</html^>
)

echo Installing locked npm dependencies...
call npm ci
if errorlevel 1 exit /b 1

if not exist "android\gradlew.bat" (
  echo Adding Android platform...
  call npx.cmd cap add android
  if errorlevel 1 exit /b 1
)

if exist "assets\icon.png" (
  call npx.cmd capacitor-assets generate --android
  if errorlevel 1 exit /b 1
)
if not exist "assets\icon.png" if exist "assets\splash.png" (
  echo Asset generation is skipped until an icon.png is provided. The APK builder will keep the default icon and use the provided splash.
)

call npx.cmd cap sync android
if errorlevel 1 exit /b 1

echo.
echo Setup complete. See README.md and run New-CapacitorApk.ps1 with your app folder.
exit /b 0
